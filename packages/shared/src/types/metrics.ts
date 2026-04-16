export interface KPIMetric {
  current: number;
  previous: number;
  change: number; // percentage change
  trend: "up" | "down" | "neutral";
  sparkline: number[]; // last 30 data points
}

export interface OverviewMetrics {
  mrr: KPIMetric;
  activeUsers: KPIMetric;
  churnRate: KPIMetric;
  netRevenue: KPIMetric;
}

export interface TimeseriesPoint {
  date: string; // ISO date
  value: number;
}

export interface RevenueTimeseries {
  period: string;
  newMrr: number;
  expansionMrr: number;
  contractionMrr: number;
  churnedMrr: number;
  netMrr: number;
  totalMrr: number;
}

export interface UserActivityTimeseries {
  date: string;
  dau: number;
  wau: number;
  mau: number;
  retentionRate: number;
}

export interface PlanDistribution {
  plan: string;
  count: number;
  mrr: number;
  percentage: number;
}

export interface CountryDistribution {
  country: string;
  count: number;
  percentage: number;
}

export type TransactionType = "payment" | "refund" | "upgrade" | "downgrade";

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  plan: string;
  type: TransactionType;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface MetricFilters {
  dateFrom?: string;
  dateTo?: string;
  plans?: string[];
  countries?: string[];
  segments?: string[];
}
