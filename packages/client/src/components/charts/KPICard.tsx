import type { KPIMetric } from "@dashboard/shared";
import { Line } from "react-chartjs-2";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  metric: KPIMetric;
  format: (value: number) => string;
  isLoading?: boolean;
  compact?: boolean;
}

export function KPICard({ title, metric, format, isLoading, compact = false }: KPICardProps) {
  const up = metric.trend === "up";
  const neutral = metric.trend === "neutral";
  const changeAbs = Math.abs(metric.change);

  if (isLoading) {
    return (
      <div className={`card ${compact ? "p-3" : "p-5"}`}>
        <div className="h-3 skeleton w-24 mb-3" />
        <div className={`skeleton w-20 mb-2 ${compact ? "h-5" : "h-8"}`} />
        {!compact && <div className="h-3 skeleton w-16" />}
      </div>
    );
  }

  const sparkColor = up ? "#16a34a" : neutral ? "#94a3b8" : "#dc2626";
  const TrendIcon = neutral ? Minus : up ? TrendingUp : TrendingDown;
  const deltaColor = neutral
    ? "text-slate-400"
    : up
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-red-600 dark:text-red-400";

  if (compact) {
    return (
      <div className="card p-3">
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 leading-tight">
          {title}
        </p>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-50 numeric tabular-nums leading-none mb-1.5">
          {format(metric.current)}
        </p>
        <div className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${deltaColor}`}>
          <TrendIcon size={10} strokeWidth={2.5} />
          <span>{changeAbs.toFixed(1)}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
        {title}
      </p>

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[28px] font-semibold text-slate-900 dark:text-slate-50 numeric tabular-nums leading-none mb-2">
            {format(metric.current)}
          </p>
          <div className={`inline-flex items-center gap-1 text-xs font-medium ${deltaColor}`}>
            <TrendIcon size={11} strokeWidth={2.5} />
            <span>{changeAbs.toFixed(1)}%</span>
            <span className="font-normal text-slate-400">vs last 30d</span>
          </div>
        </div>

        {metric.sparkline.length > 0 && (
          <div style={{ width: 72, height: 32 }} className="flex-shrink-0">
            <Line
              data={{
                labels: metric.sparkline.map(() => ""),
                datasets: [{
                  data: metric.sparkline,
                  borderColor: sparkColor,
                  borderWidth: 1.5,
                  fill: false,
                  tension: 0.4,
                  pointRadius: 0,
                }],
              }}
              options={{
                responsive: false,
                animation: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: { x: { display: false }, y: { display: false } },
              }}
              width={72}
              height={32}
            />
          </div>
        )}
      </div>
    </div>
  );
}
