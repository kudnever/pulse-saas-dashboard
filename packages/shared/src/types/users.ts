export type Permission =
  | "*"
  | "metrics:read"
  | "metrics:write"
  | "users:read"
  | "users:manage"
  | "reports:read"
  | "reports:write"
  | "reports:export";

export type RoleName = "admin" | "manager" | "viewer";

export interface Role {
  id: number;
  name: RoleName;
  permissions: Permission[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  roleId: number;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, "role"> & { role: Role };
}

export type CustomerPlan = "starter" | "growth" | "enterprise";
export type CustomerStatus = "active" | "churned" | "trial";

export interface Customer {
  id: string;
  name: string;
  email: string;
  plan: CustomerPlan;
  mrr: number;
  status: CustomerStatus;
  signedUpAt: string;
  churnedAt: string | null;
  country: string | null;
}
