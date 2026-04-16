import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import type { WsServerMessage } from "@dashboard/shared";

export type WsStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

export function useWebSocket() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<WsStatus>("disconnected");
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!accessToken) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws?token=${accessToken}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const msg: WsServerMessage = JSON.parse(event.data);

        if (msg.type === "metrics_update") {
          queryClient.setQueryData(["metrics", "live"], msg.data);
          queryClient.invalidateQueries({ queryKey: ["metrics", "overview"] });
        }

        if (msg.type === "new_transaction") {
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
        }

        if (msg.type === "new_event") {
          // Could update activity feed
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = (event) => {
      wsRef.current = null;
      if (event.code === 4001) {
        // Auth failure — don't reconnect
        setStatus("disconnected");
        return;
      }

      setStatus("reconnecting");
      const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
      reconnectAttempts.current++;
      reconnectTimeout.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [accessToken, queryClient]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      wsRef.current?.close(1000, "Component unmounted");
    };
  }, [connect]);

  return { status };
}
