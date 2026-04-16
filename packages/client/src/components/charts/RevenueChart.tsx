import { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useRevenueTimeseries } from "@/hooks/useMetrics";
import { formatCurrency, formatMonth } from "@/lib/formatters";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type PeriodOption = 3 | 6 | 12;

export function RevenueChart() {
  const [months, setMonths] = useState<PeriodOption>(12);
  const { data, isLoading } = useRevenueTimeseries(months);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  const labels = data?.map((d) => formatMonth(d.period)) ?? [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Revenue Breakdown
        </h2>
        <div className="flex gap-1 text-sm">
          {([3, 6, 12] as PeriodOption[]).map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                months === m
                  ? "bg-brand-600 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "New MRR",
              data: data?.map((d) => d.newMrr) ?? [],
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              borderRadius: 4,
            },
            {
              label: "Expansion",
              data: data?.map((d) => d.expansionMrr) ?? [],
              backgroundColor: "rgba(34, 197, 94, 0.8)",
              borderRadius: 4,
            },
            {
              label: "Contraction",
              data: data?.map((d) => d.contractionMrr) ?? [],
              backgroundColor: "rgba(251, 146, 60, 0.8)",
              borderRadius: 4,
            },
            {
              label: "Churned",
              data: data?.map((d) => d.churnedMrr) ?? [],
              backgroundColor: "rgba(239, 68, 68, 0.8)",
              borderRadius: 4,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 12 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
              },
            },
          },
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: {
              stacked: true,
              ticks: { callback: (v) => formatCurrency(Number(v)) },
            },
          },
        }}
        height={280}
      />
    </div>
  );
}
