import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@dashboard/shared";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshTokenFn: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error ?? "Login failed");
        }

        const { accessToken, refreshToken, user } = await res.json();
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      logout: () => {
        const { refreshToken, accessToken } = get();
        // Fire and forget
        if (accessToken) {
          fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ refreshToken }),
          }).catch(() => {});
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      refreshTokenFn: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error("No refresh token");

        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          throw new Error("Session expired");
        }

        const { accessToken } = await res.json();
        set({ accessToken });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export function usePermission(permission: string): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  const perms = user.role.permissions;
  return perms.includes("*" as any) || perms.includes(permission as any);
}
