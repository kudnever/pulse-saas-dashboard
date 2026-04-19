import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import type { WsServerMessage } from "@dashboard/shared";
import { Activity, Wifi, WifiOff } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "transaction" | "event";
  label: string;
  detail: string;
  amount?: number;
  time: Date;
}

const EVENT_META: Record<string, { label: string; color: string }> = {
  login:           { label: "User Login",       color: "bg-blue-400" },
  feature_use:     { label: "Feature Used",     color: "bg-violet-400" },
  api_call:        { label: "API Call",          color: "bg-cyan-400" },
  export:          { label: "Export",            color: "bg-amber-400" },
  settings_change: { label: "Settings Changed", color: "bg-slate-400" },
};

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

export function LiveActivityFeed() {
  const { accessToken } = useAuthStore();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!accessToken) return;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws?token=${accessToken}`);
    wsRef.current = ws;
    ws.onopen  = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      try {
        const msg: WsServerMessage = JSON.parse(event.data);
        if (msg.type === "new_transaction") {
          const tx = msg.data;
          setItems((prev) => [{
            id: tx.id + Date.now(),
            type: "transaction",
            label: tx.customerName ?? "Customer",
            detail: `${tx.plan} plan · ${tx.currency}`,
            amount: tx.amount,
            time: new Date(),
          }, ...prev.slice(0, 49)]);
        }
        if (msg.type === "new_event") {
          const ev = msg.data;
          const meta = EVENT_META[ev.eventType] ?? { label: ev.eventType, color: "bg-slate-400" };
          setItems((prev) => [{
            id: ev.id + Date.now(),
            type: "event",
            label: meta.label,
            detail: ev.customerId ? `uid ${ev.customerId.slice(0, 8)}` : "system",
            time: new Date(),
          }, ...prev.slice(0, 49)]);
        }
      } catch { /* ignore */ }
    };
    return () => ws.close(1000, "unmount");
  }, [accessToken]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
        <Activity size={14} className="text-indigo-500" />
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Live Activity</h2>
        <div className="ml-auto flex items-center gap-1.5">
          {connected
            ? <><Wifi size={11} className="text-emerald-400" /><span className="text-[11px] text-emerald-400">Streaming</span></>
            : <><WifiOff size={11} className="text-slate-400" /><span className="text-[11px] text-slate-400">Waiting</span></>
          }
        </div>
      </div>

      <div className="h-64 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Activity size={18} className="text-slate-400" />
            </div>
            <p className="text-sm text-slate-400">Waiting for live events…</p>
            <p className="text-xs text-slate-300 dark:text-slate-600">Events appear when the simulator triggers</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-5 py-2.5 ${i === 0 ? "animate-slide-in-right bg-indigo-50/40 dark:bg-indigo-500/5" : ""}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.type === "transaction" ? "bg-emerald-400" : (EVENT_META[item.label.toLowerCase().replace(/ /g, "_")]?.color ?? "bg-slate-400")}`} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 truncate">{item.label}</p>
                    <p className="text-xs text-slate-400 truncate">{item.detail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                  {item.amount && (
                    <span className="text-xs font-semibold text-emerald-500 tabular-nums">+${item.amount.toFixed(0)}</span>
                  )}
                  <span className="text-[11px] text-slate-400 tabular-nums">{timeAgo(item.time)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
