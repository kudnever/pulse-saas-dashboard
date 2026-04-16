import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { FilterBar } from "@/components/filters/FilterBar";
import { useCountryDistribution } from "@/hooks/useMetrics";
import { formatNumber } from "@/lib/formatters";

export const Route = createFileRoute("/dashboard/users")({
  component: UsersAnalyticsPage,
});

function UsersAnalyticsPage() {
  const { data: countries, isLoading } = useCountryDistribution();

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="User Analytics" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <FilterBar />

          {/* Country distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Geographic Distribution
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {countries?.map((item) => (
                  <div key={item.country} className="flex items-center gap-4">
                    <span className="w-8 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.country}
                    </span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-brand-500 rounded-full h-3 transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="w-24 text-right text-sm text-gray-500">
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
