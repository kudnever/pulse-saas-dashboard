export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ReportConfig {
  metrics: string[];
  filters: Record<string, unknown>;
  groupBy: string;
  dateRange: { from: string; to: string };
  chartType: "line" | "bar" | "area" | "pie";
}

export interface SavedReport {
  id: string;
  userId: string;
  name: string;
  config: ReportConfig;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}
