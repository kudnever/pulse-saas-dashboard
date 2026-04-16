import type { OverviewMetrics, Transaction } from "./metrics";

export type WsMessageType =
  | "subscribe"
  | "unsubscribe"
  | "metrics_update"
  | "new_transaction"
  | "new_event"
  | "ping"
  | "pong"
  | "error";

export interface WsSubscribeMessage {
  type: "subscribe";
  metrics: string[];
}

export interface WsMetricsUpdateMessage {
  type: "metrics_update";
  data: Partial<OverviewMetrics>;
}

export interface WsNewTransactionMessage {
  type: "new_transaction";
  data: Transaction;
}

export interface WsNewEventMessage {
  type: "new_event";
  data: {
    id: string;
    customerId: string;
    eventType: string;
    createdAt: string;
  };
}

export interface WsErrorMessage {
  type: "error";
  message: string;
}

export type WsServerMessage =
  | WsMetricsUpdateMessage
  | WsNewTransactionMessage
  | WsNewEventMessage
  | WsErrorMessage
  | { type: "pong" };

export type WsClientMessage = WsSubscribeMessage | { type: "ping" };
