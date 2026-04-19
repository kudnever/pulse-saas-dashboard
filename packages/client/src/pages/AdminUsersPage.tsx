import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/formatters";
import { usePermission } from "@/stores/authStore";
import { toast } from "sonner";

interface UserRow {
  id: string;
  email: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface RoleOption {
  id: number;
  name: string;
}

interface InviteFormState {
  fullName: string;
  email: string;
  password: string;
  roleId: string;
}

const FALLBACK_ROLES: RoleOption[] = [
  { id: 0, name: "admin" },
  { id: 0, name: "manager" },
  { id: 0, name: "viewer" },
];

const INPUT_CLASS =
  "w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400";
const LABEL_CLASS = "text-xs font-medium text-slate-600 dark:text-slate-400 mb-1";
const PRIMARY_BTN =
  "px-3 py-1.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors";
const SECONDARY_BTN =
  "px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors";

const EMPTY_FORM: InviteFormState = { fullName: "", email: "", password: "", roleId: "viewer" };

export function AdminUsersPage() {
  const canManage = usePermission("users:manage");
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState<InviteFormState>(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.get<{ data: UserRow[] }>("/users").then((r) => r.data),
  });

  const { data: rolesData } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: () => api.get<{ data: RoleOption[] }>("/users/roles").then((r) => r.data),
    enabled: canManage,
  });

  const roles = rolesData ?? FALLBACK_ROLES;

  const toggleStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/users/${id}/status`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User status updated");
    },
    onError: () => toast.error("Failed to update user"),
  });

  const inviteUser = useMutation({
    mutationFn: (body: { email: string; password: string; fullName: string; roleId: string }) =>
      api.post("/auth/register", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User invited");
      setShowInvite(false);
      setForm(EMPTY_FORM);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    inviteUser.mutate({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      roleId: form.roleId,
    });
  }

  function handleCancel() {
    setShowInvite(false);
    setForm(EMPTY_FORM);
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="User Management" />
        <main className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Page header with Invite button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage team members and their access levels.
            </p>
            {canManage && (
              <button
                onClick={() => setShowInvite((v) => !v)}
                className={PRIMARY_BTN}
              >
                {showInvite ? "Hide Form" : "Invite User"}
              </button>
            )}
          </div>

          {/* Invite form — collapsible section */}
          {showInvite && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Invite New User
              </h3>
              <form onSubmit={handleInviteSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col">
                    <label className={LABEL_CLASS}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                      placeholder="Jane Smith"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={LABEL_CLASS}>Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="jane@company.com"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={LABEL_CLASS}>Password</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Min. 8 characters"
                      className={INPUT_CLASS}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className={LABEL_CLASS}>Role</label>
                    <select
                      value={form.roleId}
                      onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                      className={INPUT_CLASS}
                    >
                      {roles.map((r) => (
                        <option key={r.name} value={r.name}>
                          {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={inviteUser.isPending}
                    className={PRIMARY_BTN}
                  >
                    {inviteUser.isPending ? "Inviting..." : "Invite User"}
                  </button>
                  <button type="button" onClick={handleCancel} className={SECONDARY_BTN}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    {(["Name", "Role", "Status", "Last Login", canManage && "Actions"] as (string | false)[])
                      .filter(Boolean)
                      .map((h) => (
                        <th
                          key={String(h)}
                          className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                        >
                          {h}
                        </th>
                      ))}
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
                            <p className="font-medium text-gray-900 dark:text-white">{user.fullName}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </td>
                          <td className="px-6 py-4 capitalize text-gray-700 dark:text-gray-300">
                            {user.roleName}
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
                                  toggleStatus.mutate({ id: user.id, isActive: !user.isActive })
                                }
                                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
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
