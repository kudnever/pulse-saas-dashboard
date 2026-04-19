import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";
import { CommandPalette } from "./components/CommandPalette";
import { usePaletteStore } from "./stores/paletteStore";

// Lazy imports
import { LoginPage } from "./pages/LoginPage";
import { OverviewPage } from "./pages/OverviewPage";
import { RevenuePage } from "./pages/RevenuePage";
import { UsersAnalyticsPage } from "./pages/UsersAnalyticsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminRolesPage } from "./pages/AdminRolesPage";

function RootLayout() {
  const { open, togglePalette, closePalette } = usePaletteStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePalette]);

  return (
    <>
      <Outlet />
      <CommandPalette open={open} onClose={closePalette} />
    </>
  );
}

function authGuard() {
  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) {
    throw redirect({ to: "/login" });
  }
}

function guestGuard() {
  const { isAuthenticated } = useAuthStore.getState();
  if (isAuthenticated) {
    throw redirect({ to: "/dashboard" });
  }
}

const rootRoute = createRootRoute({ component: RootLayout });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: guestGuard,
  component: LoginPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: authGuard,
  component: () => <Outlet />,
});

const overviewRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: OverviewPage,
});

const revenueRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/revenue",
  component: RevenuePage,
});

const usersRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/users",
  component: UsersAnalyticsPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/reports",
  component: ReportsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/settings",
  component: SettingsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: authGuard,
  component: () => <Outlet />,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/users",
  component: AdminUsersPage,
});

const adminRolesRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/roles",
  component: AdminRolesPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute.addChildren([
    overviewRoute,
    revenueRoute,
    usersRoute,
    reportsRoute,
    settingsRoute,
  ]),
  adminRoute.addChildren([adminUsersRoute, adminRolesRoute]),
]);

export const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
