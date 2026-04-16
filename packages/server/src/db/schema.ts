import {
  pgTable,
  serial,
  varchar,
  uuid,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  index,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { Permission } from "@dashboard/shared";

// --- Auth & RBAC ---
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).unique().notNull(),
  permissions: jsonb("permissions").$type<Permission[]>().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  avatarUrl: varchar("avatar_url"),
  roleId: integer("role_id")
    .references(() => roles.id)
    .notNull(),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Business Data ---
export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(), // "starter" | "growth" | "enterprise"
  mrr: numeric("mrr", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // "active" | "churned" | "trial"
  signedUpAt: timestamp("signed_up_at").notNull(),
  churnedAt: timestamp("churned_at"),
  country: varchar("country", { length: 2 }),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id").references(() => customers.id),
  type: varchar("type", { length: 20 }).notNull(), // "payment" | "refund" | "upgrade" | "downgrade"
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").references(() => customers.id),
    eventType: varchar("event_type", { length: 50 }).notNull(),
    // "signup" | "login" | "feature_use" | "upgrade" | "support_ticket"
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    eventTypeIdx: index("events_type_idx").on(table.eventType),
    createdAtIdx: index("events_created_at_idx").on(table.createdAt),
  })
);

// --- Reports ---
export const savedReports = pgTable("saved_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  name: varchar("name", { length: 200 }).notNull(),
  config: jsonb("config").notNull(),
  isShared: boolean("is_shared").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Audit Log ---
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    action: varchar("action", { length: 100 }).notNull(),
    targetType: varchar("target_type", { length: 50 }),
    targetId: varchar("target_id", { length: 255 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("audit_logs_user_idx").on(table.userId),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  })
);

// --- Relations ---
export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, { fields: [users.roleId], references: [roles.id] }),
  refreshTokens: many(refreshTokens),
  savedReports: many(savedReports),
  auditLogs: many(auditLogs),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  transactions: many(transactions),
  events: many(events),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  customer: one(customers, {
    fields: [events.customerId],
    references: [customers.id],
  }),
}));

export const savedReportsRelations = relations(savedReports, ({ one }) => ({
  user: one(users, { fields: [savedReports.userId], references: [users.id] }),
}));
