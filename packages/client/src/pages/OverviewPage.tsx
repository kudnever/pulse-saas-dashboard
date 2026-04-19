import { useOverviewMetrics } from "@/hooks/useMetrics";
import { useWebSocket } from "@/hooks/useWebSocket";
import { KPICard } from "@/components/charts/KPICard";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { PlanDistributionChart } from "@/components/charts/PlanDistributionChart";
import { TransactionsTable } from "@/components/tables/TransactionsTable";
import { FilterBar } from "@/components/filters/FilterBar";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import { AIInsightsPanel } from "@/components/AIInsightsPanel";
import { formatCurrency, formatNumber } from "@/lib/formatters";

const emptyMetric = { current: 0, previous: 0, change: 0, trend: "neutral" as const, sparkline: [] };

const pct = (v: number) => `${v.toFixed(1)}%`;
const currency = (v: number) => formatCurrency(v);
const number = (v: number) => formatNumber(v);
const x = (v: number) => `${v.toFixed(1)}x`;
const months = (v: number) => `${v.toFixed(0)} mo`;

export function OverviewPage() {
  const { data: metrics, isLoading } = useOverviewMetrics();
  const { status: wsStatus } = useWebSocket();

  const mrr = metrics?.mrr.current ?? 0;
  const activeUsers = metrics?.activeUsers.current ?? 1;
  const churnRate = metrics?.churnRate.current ?? 1;

  // Derived secondary metrics
  const arr = mrr * 12;
  const arpu = activeUsers > 0 ? mrr / activeUsers : 0;
  // LTV = ARPU / monthly_churn_rate  (churnRate is %, so /100)
  const ltv = churnRate > 0 ? arpu / (churnRate / 100) : 0;
  // CAC is typically external spend / new customers — mock at ~3 months of ARPU
  const cac = arpu * 3;
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  // NRR mock: expansion typically ~15% of MRR, churn ~8% → NRR ≈ 107%
  const nrr = 107.2;

  const primaryCards = [
    { title: "Monthly Recurring Revenue", metric: metrics?.mrr ?? emptyMetric, format: currency },
    { title: "Active Customers",           metric: metrics?.activeUsers ?? emptyMetric, format: number },
    { title: "Churn Rate",                 metric: metrics?.churnRate ?? emptyMetric, format: pct },
    { title: "Net Revenue (30d)",          metric: metrics?.netRevenue ?? emptyMetric, format: currency },
  ];

  const makeSecondary = (current: number, prev: number, invertTrend = false) => {
    const change = prev > 0 ? parseFloat((((current - prev) / prev) * 100).toFixed(1)) : 0;
    const up = change >= 0;
    return {
      current,
      previous: prev,
      change: Math.abs(change),
      trend: (invertTrend ? !up : up) ? "up" as const : "down" as const,
      sparkline: [] as number[],
    };
  };

  const secondaryCards = [
    { title: "Annual Recurring Revenue", metric: makeSecondary(arr, arr * 0.88), format: currency },
    { title: "ARPU",                     metric: makeSecondary(arpu, arpu * 0.96), format: currency },
    { title: "Customer LTV",             metric: makeSecondary(ltv, ltv * 0.94), format: currency },
    { title: "LTV : CAC",                metric: makeSecondary(ltvCacRatio, ltvCacRatio * 0.97), format: x },
    { title: "Net Revenue Retention",    metric: makeSecondary(nrr, 104.1), format: pct },
    { title: "Avg Payback Period",       metric: makeSecondary(3, 3.4, true), format: months },
  ];

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Overview" wsStatus={wsStatus} />
        <main className="flex-1 overflow-y-auto p-6 space-y-5 fade-in bg-slate-50 dark:bg-[#0b0f1a]">
          <FilterBar />

          {/* Primary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {primaryCards.map((card, i) => (
              <KPICard key={i} title={card.title} metric={card.metric} format={card.format} isLoading={isLoading} />
            ))}
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {secondaryCards.map((card, i) => (
              <KPICard key={i} title={card.title} metric={card.metric} format={card.format} isLoading={isLoading} compact />
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 slide-up">
              <RevenueChart />
            </div>
            <div className="slide-up" style={{ animationDelay: "60ms" }}>
              <PlanDistributionChart />
            </div>
          </div>

          {/* Insights + Activity row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="slide-up" style={{ animationDelay: "120ms" }}>
              <AIInsightsPanel />
            </div>
            <div className="slide-up" style={{ animationDelay: "180ms" }}>
              <LiveActivityFeed />
            </div>
          </div>

          <TransactionsTable />
        </main>
      </div>
    </div>
  );
}
