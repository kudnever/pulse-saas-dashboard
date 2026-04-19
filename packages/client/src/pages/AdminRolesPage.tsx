import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

const ROLES = [
  { name: "Admin", permissions: ["*"], description: "Full access to all features" },
  { name: "Manager", permissions: ["metrics:read", "reports:read", "reports:write", "reports:export", "users:read"], description: "Can view metrics, manage reports, see users" },
  { name: "Viewer", permissions: ["metrics:read", "reports:read"], description: "Read-only access to metrics and reports" },
];

export function AdminRolesPage() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Role Management" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
            {ROLES.map((role) => (
              <div key={role.name} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{role.name}</h3>
                    <p className="text-xs text-gray-400">{role.description}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Permissions</p>
                  {role.permissions.map((p) => (
                    <span key={p} className="inline-block mr-1.5 mb-1.5 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
