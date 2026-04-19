import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { FilterBar } from "@/components/filters/FilterBar";
import { CohortHeatmap } from "@/components/charts/CohortHeatmap";
import { useCountryDistribution } from "@/hooks/useMetrics";
import { formatNumber } from "@/lib/formatters";

export function UsersAnalyticsPage() {
  const { data: countries, isLoading } = useCountryDistribution();

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="User Analytics" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50 dark:bg-[#0b0f1a]">
          <FilterBar />

          <CohortHeatmap />

          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-5">
              Geographic Distribution
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 skeleton" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {countries?.map((item) => (
                  <div key={item.country} className="flex items-center gap-4">
                    <span className="w-8 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.country}
                    </span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-indigo-500 rounded-full h-2 transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-28 text-right text-xs text-slate-500 tabular-nums">
                      {formatNumber(item.count)} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
