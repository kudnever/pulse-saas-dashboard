import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { useRevenueTimeseries } from "@/hooks/useMetrics";
import { formatCurrency } from "@/lib/formatters";

type PeriodOption = 3 | 6 | 12;

const LABELS = ["Starting MRR", "New", "Expansion", "Contraction", "Churn", "Ending MRR"];

const BAR_COLORS = {
  positive: "rgba(16,185,129,0.85)",
  negative: "rgba(244,63,94,0.85)",
  neutral: "rgba(99,102,241,0.85)",
  neutralEnd: "rgba(139,92,246,0.85)",
};

export function MRRWaterfallChart() {
  const [months, setMonths] = useState<PeriodOption>(12);
  const { data, isLoading } = useRevenueTimeseries(months);

  if (isLoading) {
    return (
      <div className="card p-5">
        <div className="h-4 skeleton w-48 mb-5" />
        <div className="h-64 skeleton" />
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  const totalNew = data.reduce((s, d) => s + d.newMrr, 0);
  const totalExpansion = data.reduce((s, d) => s + d.expansionMrr, 0);
  const totalContraction = data.reduce((s, d) => s + d.contractionMrr, 0);
  const totalChurned = data.reduce((s, d) => s + d.churnedMrr, 0);

  // totalMrr in the data is monthly revenue (not cumulative), so derive a
  // consistent start/end from the first month's totalMrr + summed movements.
  const startMrr = data[0].totalMrr;
  const endMrr = startMrr + totalNew + totalExpansion - totalContraction - totalChurned;

  // Cumulative levels as each bar lands
  const levelAfterNew = startMrr + totalNew;
  const levelAfterExpansion = levelAfterNew + totalExpansion;
  const levelAfterContraction = levelAfterExpansion - totalContraction;

  // Spacer bars (transparent, just offset the visible bar up)
  const spacers = [
    0,                       // Starting MRR (from 0)
    startMrr,                // New MRR (floats from startMrr)
    levelAfterNew,           // Expansion (floats from levelAfterNew)
    levelAfterContraction,   // Contraction (base of the downward bar)
    endMrr,                  // Churn (base of churn bar, goes up to levelAfterContraction)
    0,                       // Ending MRR (from 0)
  ];

  const values = [startMrr, totalNew, totalExpansion, totalContraction, totalChurned, endMrr];
  const colors = [
    BAR_COLORS.neutral,
    BAR_COLORS.positive,
    BAR_COLORS.positive,
    BAR_COLORS.negative,
    BAR_COLORS.negative,
    BAR_COLORS.neutralEnd,
  ];

  const netGrowth = endMrr - startMrr;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
            MRR Movement
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Net change:{" "}
            <span className={netGrowth >= 0 ? "text-emerald-500" : "text-rose-500"}>
              {netGrowth >= 0 ? "+" : ""}
              {formatCurrency(netGrowth)}
            </span>{" "}
            over {months} months
          </p>
        </div>
        <div className="flex gap-1 text-xs">
          {([3, 6, 12] as PeriodOption[]).map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium ${
                months === m
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", height: "280px" }}>
        <Bar
          data={{
            labels: LABELS,
            datasets: [
              {
                label: "_spacer",
                data: spacers,
                backgroundColor: "transparent",
                borderWidth: 0,
                stack: "waterfall",
              },
              {
                label: "MRR",
                data: values,
                backgroundColor: colors,
                borderRadius: 4,
                borderSkipped: false,
                stack: "waterfall",
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500 },
            plugins: {
              legend: { display: false },
              tooltip: {
                filter: (item) => item.dataset.label !== "_spacer",
                callbacks: {
                  label: (ctx) => {
                    const label = ctx.label ?? "";
                    const val = ctx.parsed.y ?? 0;
                    if (label === "Contraction" || label === "Churn") {
                      return `${label}: −${formatCurrency(val)}`;
                    }
                    return `${label}: ${formatCurrency(val)}`;
                  },
                  title: () => "",
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

      {/* Legend row */}
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
          Growth
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
          Losses
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
          Total MRR
        </span>
      </div>
    </div>
  );
}
