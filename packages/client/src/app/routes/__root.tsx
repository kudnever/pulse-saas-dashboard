import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => <Outlet />,
});
