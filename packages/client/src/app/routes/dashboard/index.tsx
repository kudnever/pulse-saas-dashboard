import { createFileRoute } from "@tanstack/react-router";
import { useOverviewMetrics } from "@/hooks/useMetrics";
import { KPICard } from "@/components/charts/KPICard";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { PlanDistributionChart } from "@/components/charts/PlanDistributionChart";
import { TransactionsTable } from "@/components/tables/TransactionsTable";
import { FilterBar } from "@/components/filters/FilterBar";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters";

export const Route = createFileRoute("/dashboard/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { data: metrics, isLoading } = useOverviewMetrics();

  const kpiCards = [
    {
      title: "Monthly Recurring Revenue",
      metric: metrics?.mrr,
      format: formatCurrency,
    },
    {
      title: "Active Users",
      metric: metrics?.activeUsers,
      format: formatNumber,
    },
    {
      title: "Churn Rate",
      metric: metrics?.churnRate,
      format: (v: number) => `${v.toFixed(1)}%`,
    },
    {
      title: "Net Revenue (30d)",
      metric: metrics?.netRevenue,
      format: formatCurrency,
    },
  ];

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Overview" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Filters */}
          <FilterBar />

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((card, i) =>
              card.metric ? (
                <KPICard
                  key={i}
                  title={card.title}
                  metric={card.metric}
                  format={card.format}
                  isLoading={isLoading}
                />
              ) : (
                <KPICard
                  key={i}
                  title={card.title}
                  metric={{
                    current: 0,
                    previous: 0,
                    change: 0,
                    trend: "neutral",
                    sparkline: [],
                  }}
                  format={card.format}
                  isLoading={isLoading}
                />
              )
            )}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <div>
              <PlanDistributionChart />
            </div>
          </div>

          {/* Transactions table */}
          <TransactionsTable />
        </main>
      </div>
    </div>
  );
}
