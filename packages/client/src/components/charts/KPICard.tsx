import { useEffect, useRef, useState } from "react";
import type { KPIMetric } from "@dashboard/shared";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

interface KPICardProps {
  title: string;
  metric: KPIMetric;
  format: (value: number) => string;
  isLoading?: boolean;
  highlighted?: boolean;
}

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const frame = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(target * eased);
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

export function KPICard({ title, metric, format, isLoading, highlighted }: KPICardProps) {
  const animatedValue = useCountUp(metric.current);
  const isPositiveTrend = metric.trend === "up";
  const changeAbs = Math.abs(metric.change);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 border transition-all duration-300 ${
        highlighted
          ? "border-brand-500 shadow-md shadow-brand-100 dark:shadow-brand-900/20"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {format(animatedValue)}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm">
          <span
            className={`font-medium ${
              isPositiveTrend ? "text-green-600 dark:text-green-400" : "text-red-500"
            }`}
          >
            {isPositiveTrend ? "↑" : "↓"} {changeAbs.toFixed(1)}%
          </span>
          <span className="text-gray-400">vs last month</span>
        </div>

        {/* Sparkline */}
        <div className="w-20 h-8">
          <Line
            data={{
              labels: metric.sparkline.map(() => ""),
              datasets: [
                {
                  data: metric.sparkline,
                  borderColor: isPositiveTrend ? "#22c55e" : "#ef4444",
                  borderWidth: 1.5,
                  fill: true,
                  backgroundColor: isPositiveTrend ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  tension: 0.4,
                  pointRadius: 0,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, tooltip: { enabled: false } },
              scales: { x: { display: false }, y: { display: false } },
              animation: false,
            }}
          />
        </div>
      </div>
    </div>
  );
}
