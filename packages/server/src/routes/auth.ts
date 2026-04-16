import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../db/client";
import { users, roles, refreshTokens } from "../db/schema";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { validate } from "../middleware/validate";
import { requireAuth } from "../middleware/auth";
import type { AuthenticatedRequest } from "../middleware/auth";
import type { Role } from "@dashboard/shared";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

router.post("/login", validate(loginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const result = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
      roleId: users.roleId,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      role: {
        id: roles.id,
        name: roles.name,
        permissions: roles.permissions,
        createdAt: roles.createdAt,
      },
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];
  if (!user || !user.isActive) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const accessToken = signAccessToken({ userId: user.id, roleId: user.roleId });
  const refreshToken = signRefreshToken({ userId: user.id });

  // Store refresh token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(refreshTokens).values({ userId: user.id, token: refreshToken, expiresAt });

  // Update last login
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl ?? null,
      roleId: user.roleId,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      createdAt: user.createdAt?.toISOString() ?? "",
      role: {
        ...user.role,
        name: user.role.name as Role["name"],
        permissions: user.role.permissions as Role["permissions"],
        createdAt: user.role.createdAt?.toISOString() ?? "",
      },
    },
  });
});

router.post("/refresh", validate(refreshSchema), async (req, res) => {
  const { refreshToken } = req.body as z.infer<typeof refreshSchema>;

  try {
    const payload = verifyRefreshToken(refreshToken);

    // Check token in DB
    const stored = await db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, refreshToken),
          eq(refreshTokens.userId, payload.userId),
          gt(refreshTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!stored[0]) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    // Get user role for new access token
    const userResult = await db
      .select({ roleId: users.roleId })
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!userResult[0]) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const newAccessToken = signAccessToken({
      userId: payload.userId,
      roleId: userResult[0].roleId,
    });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

router.post("/logout", requireAuth as any, async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
  }
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth as any, (req, res) => {
  const { user } = req as AuthenticatedRequest;
  res.json({ user });
});

export default router;
