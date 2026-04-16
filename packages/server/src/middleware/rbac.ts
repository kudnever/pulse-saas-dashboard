import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth";
import type { Permission } from "@dashboard/shared";

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const { permissions } = req.user.role;
    if (permissions.includes("*") || permissions.includes(permission)) {
      next();
      return;
    }
    res.status(403).json({ error: "Insufficient permissions" });
  };
}
