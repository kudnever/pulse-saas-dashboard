import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/stores/authStore";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Settings" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 max-w-lg">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profile
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Full Name</label>
                <p className="text-gray-900 dark:text-white font-medium">{user?.fullName}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Email</label>
                <p className="text-gray-900 dark:text-white">{user?.email}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Role</label>
                <p className="text-gray-900 dark:text-white capitalize">{user?.role.name}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Permissions</label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {user?.role.permissions.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 text-xs font-mono"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
