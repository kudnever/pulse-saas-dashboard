import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { usePlanDistribution } from "@/hooks/useMetrics";
import { formatCurrency, formatNumber } from "@/lib/formatters";

ChartJS.register(ArcElement, Tooltip, Legend);

const PLAN_COLORS: Record<string, string> = {
  starter: "rgba(59, 130, 246, 0.8)",
  growth: "rgba(34, 197, 94, 0.8)",
  enterprise: "rgba(168, 85, 247, 0.8)",
};

export function PlanDistributionChart() {
  const { data, isLoading } = usePlanDistribution();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto w-48" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Revenue by Plan
      </h2>

      <div className="flex flex-col items-center">
        <div className="w-48 h-48">
          <Doughnut
            data={{
              labels: data?.map((d) => d.plan.charAt(0).toUpperCase() + d.plan.slice(1)) ?? [],
              datasets: [
                {
                  data: data?.map((d) => d.mrr) ?? [],
                  backgroundColor: data?.map((d) => PLAN_COLORS[d.plan] ?? "#94a3b8") ?? [],
                  borderWidth: 0,
                },
              ],
            }}
            options={{
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `${ctx.label}: ${formatCurrency(ctx.parsed)}`,
                  },
                },
              },
              cutout: "70%",
            }}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 w-full space-y-2">
          {data?.map((item) => (
            <div key={item.plan} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PLAN_COLORS[item.plan] ?? "#94a3b8" }}
                />
                <span className="capitalize text-gray-600 dark:text-gray-300">{item.plan}</span>
              </div>
              <div className="text-right">
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.percentage}%
                </span>
                <span className="text-gray-400 ml-2">{formatNumber(item.count)} customers</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
