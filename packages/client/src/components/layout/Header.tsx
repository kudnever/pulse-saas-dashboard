import { Moon, Sun, Search } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { usePaletteStore } from "@/stores/paletteStore";
import { useState, useEffect } from "react";

interface HeaderProps {
  title: string;
  wsStatus?: "connecting" | "connected" | "disconnected" | "reconnecting";
}

const statusDot: Record<string, string> = {
  connected:    "bg-emerald-400",
  connecting:   "bg-amber-400 animate-pulse",
  reconnecting: "bg-amber-400 animate-pulse",
  disconnected: "bg-slate-500",
};

const statusLabel: Record<string, string> = {
  connected:    "Live",
  connecting:   "Connecting",
  reconnecting: "Reconnecting",
  disconnected: "Offline",
};

export function Header({ title, wsStatus = "disconnected" }: HeaderProps) {
  const { user } = useAuthStore();
  const openPalette = usePaletteStore((s) => s.openPalette);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : document.documentElement.classList.contains("dark");
  });

  function toggleDark() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setDark(next);
  }

  // Sync state if toggled from command palette
  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-[#0d1117] border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between px-6 flex-shrink-0 gap-4">
      {/* Left */}
      <h1 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 flex-shrink-0">
        {title}
      </h1>

      {/* Centre — search trigger */}
      <button
        onClick={openPalette}
        className="hidden md:flex flex-1 max-w-xs items-center gap-2 px-3 py-2 text-sm text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
      >
        <Search size={13} />
        <span className="flex-1 text-left text-[13px]">Search commands…</span>
        <kbd className="text-[10px] font-mono bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded text-slate-400">
          ⌘K
        </kbd>
      </button>

      {/* Right */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* WS status */}
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${statusDot[wsStatus] ?? "bg-slate-500"}`} />
          <span className={`text-xs font-medium ${wsStatus === "connected" ? "text-emerald-500" : "text-slate-400"}`}>
            {statusLabel[wsStatus] ?? "Unknown"}
          </span>
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {user?.fullName?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200 leading-none">{user?.fullName}</p>
            <p className="text-[11px] text-slate-400 capitalize mt-0.5">{user?.role.name}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
