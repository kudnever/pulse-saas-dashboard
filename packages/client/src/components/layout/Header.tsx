import { useAuthStore } from "@/stores/authStore";
import { useWebSocket } from "@/hooks/useWebSocket";

const statusColors: Record<string, string> = {
  connected: "bg-green-500",
  connecting: "bg-yellow-500",
  reconnecting: "bg-yellow-500 animate-pulse",
  disconnected: "bg-gray-400",
};

const statusLabels: Record<string, string> = {
  connected: "Live",
  connecting: "Connecting...",
  reconnecting: "Reconnecting...",
  disconnected: "Offline",
};

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { status } = useWebSocket();

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>

      <div className="flex items-center gap-4">
        {/* WebSocket status */}
        <div className="flex items-center gap-2 text-sm">
          <div
            className={`w-2 h-2 rounded-full ${statusColors[status] ?? "bg-gray-400"} ${
              status === "connected" ? "animate-pulse" : ""
            }`}
          />
          <span
            className={
              status === "connected" ? "text-green-600 dark:text-green-400" : "text-gray-500"
            }
          >
            {statusLabels[status] ?? "Unknown"}
          </span>
        </div>

        {/* Dark mode toggle placeholder */}
        <button
          onClick={() => document.documentElement.classList.toggle("dark")}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Toggle dark mode"
        >
          🌙
        </button>

        {/* User menu */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role.name}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
