import { useState } from "react";
import { Chart } from "react-chartjs-2";
import type { Plugin, FillTarget } from "chart.js";
import { Download } from "lucide-react";
import { useRevenueTimeseries } from "@/hooks/useMetrics";
import { formatCurrency, formatMonth } from "@/lib/formatters";

function downloadCSV(rows: Record<string, string | number>[], filename: string) {
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => r[h]).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type PeriodOption = 3 | 6 | 12;

function linearForecast(values: number[], steps: number): number[] {
  const n = values.length;
  if (n < 2) return Array(steps).fill(values[0] ?? 0);
  const sumX = (n * (n - 1)) / 2;
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((acc, y, x) => acc + x * y, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return Array.from({ length: steps }, (_, i) => Math.max(0, intercept + slope * (n + i)));
}

function nextMonthLabels(lastPeriod: string, count: number): string[] {
  const [year, month] = lastPeriod.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(year, month + i, 1);
    return formatMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  });
}

// Applies a canvas gradient to the forecast fill area before each draw
const forecastGradientPlugin: Plugin = {
  id: "forecastGradient",
  beforeDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    for (const ds of chart.data.datasets) {
      if (ds.label === "Forecast") {
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "rgba(139,92,246,0.45)");
        gradient.addColorStop(0.55, "rgba(139,92,246,0.12)");
        gradient.addColorStop(1, "rgba(139,92,246,0.0)");
        (ds as unknown as Record<string, unknown>).backgroundColor = gradient;
      }
    }
  },
};

const CONFIDENCE_UPPER = "Confidence Upper";
const CONFIDENCE_LOWER = "Confidence Lower";

export function RevenueChart() {
  const [months, setMonths] = useState<PeriodOption>(12);
  const [showForecast, setShowForecast] = useState(false);
  const { data, isLoading } = useRevenueTimeseries(months);

  if (isLoading) {
    return (
      <div className="card p-5">
        <div className="h-4 skeleton w-40 mb-5" />
        <div className="h-64 skeleton" />
      </div>
    );
  }

  const historicalLabels = data?.map((d) => formatMonth(d.period)) ?? [];
  const FORECAST_STEPS = 3;
  const n = historicalLabels.length;

  const forecastLabels =
    showForecast && data && data.length > 0
      ? nextMonthLabels(data[data.length - 1].period, FORECAST_STEPS)
      : [];

  const allLabels = [...historicalLabels, ...forecastLabels];
  const netMrr =
    data?.map((d) => d.newMrr + d.expansionMrr - d.contractionMrr - d.churnedMrr) ?? [];
  const forecastValues = showForecast ? linearForecast(netMrr, FORECAST_STEPS) : [];
  const lastHistorical = netMrr.length > 0 ? netMrr[netMrr.length - 1] : 0;

  // Builds a full-length array: nulls for all historical except the connection point
  const buildLine = (values: number[]) => [
    ...Array(Math.max(0, n - 1)).fill(null),
    lastHistorical,
    ...values,
  ];

  // Confidence cone widens by 5% per step (±5%, ±10%, ±15%)
  const upperValues = forecastValues.map((v, i) => v * (1 + 0.05 * (i + 1)));
  const lowerValues = forecastValues.map((v, i) => Math.max(0, v * (1 - 0.05 * (i + 1))));

  const forecastMainData = showForecast ? buildLine(forecastValues) : [];
  const upperData = showForecast ? buildLine(upperValues) : [];
  const lowerData = showForecast ? buildLine(lowerValues) : [];

  // Show dots only on actual forecast months, not the connecting historical point
  const forecastPointRadius = forecastMainData.map((_, i) => (i >= n ? 4 : 0));
  const bandPointRadius = 0;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          Revenue Breakdown
        </h2>
        <div className="flex items-center gap-1.5">
          {data && data.length > 0 && (
            <button
              onClick={() =>
                downloadCSV(
                  data.map((d) => ({
                    Period: d.period,
                    "New MRR": d.newMrr.toFixed(2),
                    "Expansion MRR": d.expansionMrr.toFixed(2),
                    "Contraction MRR": d.contractionMrr.toFixed(2),
                    "Churned MRR": d.churnedMrr.toFixed(2),
                    "Net MRR": d.netMrr.toFixed(2),
                  })),
                  `pulse-revenue-${months}m.csv`
                )
              }
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Download CSV"
            >
              <Download size={12} />
              <span>CSV</span>
            </button>
          )}
          <button
            onClick={() => setShowForecast((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              showForecast
                ? "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span>Forecast</span>
          </button>
          <div className="flex gap-1 text-xs">
            {([3, 6, 12] as PeriodOption[]).map((m) => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  months === m
                    ? "bg-indigo-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {m}M
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: "relative", height: "280px" }}>
        <Chart
          type="bar"
          plugins={[forecastGradientPlugin]}
          data={{
            labels: allLabels,
            datasets: [
              {
                type: "bar" as const,
                label: "New MRR",
                data: data?.map((d) => d.newMrr) ?? [],
                backgroundColor: "rgba(99,102,241,0.8)",
                borderRadius: 3,
                stack: "hist",
              },
              {
                type: "bar" as const,
                label: "Expansion",
                data: data?.map((d) => d.expansionMrr) ?? [],
                backgroundColor: "rgba(16,185,129,0.8)",
                borderRadius: 3,
                stack: "hist",
              },
              {
                type: "bar" as const,
                label: "Contraction",
                data: data?.map((d) => d.contractionMrr) ?? [],
                backgroundColor: "rgba(245,158,11,0.8)",
                borderRadius: 3,
                stack: "hist",
              },
              {
                type: "bar" as const,
                label: "Churned",
                data: data?.map((d) => d.churnedMrr) ?? [],
                backgroundColor: "rgba(244,63,94,0.8)",
                borderRadius: 3,
                stack: "hist",
              },
              ...(showForecast
                ? [
                    // Upper confidence bound — fills toward lower bound (+1)
                    {
                      type: "line" as const,
                      label: CONFIDENCE_UPPER,
                      data: upperData,
                      borderColor: "rgba(139,92,246,0.25)",
                      backgroundColor: "rgba(139,92,246,0.08)",
                      borderWidth: 1,
                      borderDash: [3, 3],
                      pointRadius: bandPointRadius,
                      fill: "+1" as FillTarget,
                      tension: 0.3,
                      stack: undefined,
                    },
                    // Lower confidence bound
                    {
                      type: "line" as const,
                      label: CONFIDENCE_LOWER,
                      data: lowerData,
                      borderColor: "rgba(139,92,246,0.25)",
                      backgroundColor: "rgba(139,92,246,0.0)",
                      borderWidth: 1,
                      borderDash: [3, 3],
                      pointRadius: bandPointRadius,
                      fill: false as const,
                      tension: 0.3,
                      stack: undefined,
                    },
                    // Main forecast line — gradient fill applied by plugin
                    {
                      type: "line" as const,
                      label: "Forecast",
                      data: forecastMainData,
                      borderColor: "rgba(139,92,246,0.9)",
                      backgroundColor: "rgba(139,92,246,0.3)", // overwritten by gradient plugin
                      borderWidth: 2,
                      borderDash: [6, 4],
                      pointBackgroundColor: "rgba(139,92,246,1)",
                      pointRadius: forecastPointRadius,
                      pointHoverRadius: 6,
                      fill: "origin" as FillTarget,
                      tension: 0.3,
                      stack: undefined,
                    },
                  ]
                : []),
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  boxWidth: 10,
                  boxHeight: 10,
                  borderRadius: 2,
                  useBorderRadius: true,
                  font: { size: 12 },
                  color: "#94a3b8",
                  padding: 16,
                  filter: (item) =>
                    item.text !== CONFIDENCE_UPPER && item.text !== CONFIDENCE_LOWER,
                },
              },
              tooltip: {
                filter: (item) =>
                  item.dataset.label !== CONFIDENCE_UPPER &&
                  item.dataset.label !== CONFIDENCE_LOWER,
                callbacks: {
                  label: (ctx) =>
                    ctx.parsed.y != null
                      ? `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
                      : "",
                },
              },
            },
            scales: {
              x: {
                stacked: true,
                grid: { display: false },
                border: { display: false },
                ticks: { color: "#94a3b8", font: { size: 11 } },
              },
              y: {
                stacked: true,
                border: { display: false },
                grid: { color: "rgba(148,163,184,0.1)" },
                ticks: {
                  color: "#94a3b8",
                  font: { size: 11 },
                  callback: (v) => formatCurrency(Number(v)),
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
