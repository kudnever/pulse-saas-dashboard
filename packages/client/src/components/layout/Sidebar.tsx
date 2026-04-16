import { Link, useRouterState } from "@tanstack/react-router";
import { usePermission } from "@/stores/authStore";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  permission?: string;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "📊" },
  { label: "Revenue", href: "/dashboard/revenue", icon: "💰", permission: "metrics:read" },
  { label: "Users", href: "/dashboard/users", icon: "👥", permission: "metrics:read" },
  { label: "Reports", href: "/dashboard/reports", icon: "📋", permission: "reports:read" },
  { label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

const adminItems: NavItem[] = [
  { label: "Users", href: "/admin/users", icon: "🔑", permission: "users:read" },
  { label: "Roles", href: "/admin/roles", icon: "🛡️", permission: "users:manage" },
];

export function Sidebar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const canManageUsers = usePermission("users:read");

  function isActive(href: string) {
    return href === "/dashboard"
      ? currentPath === "/dashboard"
      : currentPath.startsWith(href);
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
          📈 Analytica
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Dashboard
        </p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        {canManageUsers && (
          <>
            <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">
              Admin
            </p>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
