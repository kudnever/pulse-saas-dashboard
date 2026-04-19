import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function SettingsPage() {
  const { user } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      api.post("/auth/change-password", { currentPassword, newPassword }),
    onSuccess: () => {
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: () => toast.error("Failed to update password"),
  });

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    changePasswordMutation.mutate();
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Settings" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50 dark:bg-[#0b0f1a]">
          {/* Profile */}
          <div className="card p-5 max-w-lg">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
              Profile
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  Full Name
                </label>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.fullName}
                </p>
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  Email
                </label>
                <p className="text-sm text-slate-900 dark:text-slate-100">{user?.email}</p>
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  Role
                </label>
                <p className="text-sm text-slate-900 dark:text-slate-100 capitalize">
                  {user?.role.name}
                </p>
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  Permissions
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {user?.role.permissions.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="card p-5 max-w-lg">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
              Change Password
            </h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    changePasswordMutation.isPending
                  }
                  className="px-3 py-1.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

          {/* Preferences */}
          <div className="card p-5 max-w-lg">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
              Preferences
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Theme</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Toggle in the top bar
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
