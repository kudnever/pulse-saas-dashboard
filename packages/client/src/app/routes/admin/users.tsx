import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/formatters";
import { usePermission } from "@/stores/authStore";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

function AdminUsersPage() {
  const canManage = usePermission("users:manage");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.get<{ data: UserRow[] }>("/users").then((r) => r.data),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/users/${id}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User status updated");
    },
    onError: () => toast.error("Failed to update user"),
  });

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="User Management" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                      Last Login
                    </th>
                    {canManage && (
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {[1, 2, 3, 4].map((j) => (
                            <td key={j} className="px-6 py-4">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : data?.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize text-gray-700 dark:text-gray-300">
                              {user.roleName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.isActive
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                              }`}
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : "Never"}
                          </td>
                          {canManage && (
                            <td className="px-6 py-4">
                              <button
                                onClick={() =>
                                  toggleStatus.mutate({
                                    id: user.id,
                                    isActive: !user.isActive,
                                  })
                                }
                                className="text-xs text-brand-600 hover:text-brand-800 transition-colors"
                              >
                                {user.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
