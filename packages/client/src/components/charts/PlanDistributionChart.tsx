import { Doughnut } from "react-chartjs-2";
import { usePlanDistribution } from "@/hooks/useMetrics";
import { formatCurrency } from "@/lib/formatters";

const PLAN_COLORS: Record<string, { fill: string; ring: string }> = {
  starter:    { fill: "rgba(99,102,241,0.85)",  ring: "#6366f1" },
  growth:     { fill: "rgba(16,185,129,0.85)",  ring: "#10b981" },
  enterprise: { fill: "rgba(245,158,11,0.85)",  ring: "#f59e0b" },
};

export function PlanDistributionChart() {
  const { data, isLoading } = usePlanDistribution();

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="h-5 skeleton w-36 mb-5" />
        <div className="h-44 skeleton rounded-full mx-auto w-44" />
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-5">
        Revenue by Plan
      </h2>

      <div className="flex flex-col items-center">
        <div style={{ width: 170, height: 170 }}>
          <Doughnut
            data={{
              labels: data?.map((d) => d.plan.charAt(0).toUpperCase() + d.plan.slice(1)) ?? [],
              datasets: [{
                data: data?.map((d) => d.mrr) ?? [],
                backgroundColor: data?.map((d) => PLAN_COLORS[d.plan]?.fill ?? "#94a3b8") ?? [],
                borderWidth: 0,
                hoverOffset: 6,
              }],
            }}
            options={{
              responsive: false,
              animation: { duration: 500 },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.parsed)}`,
                  },
                },
              },
              cutout: "72%",
            }}
            width={170}
            height={170}
          />
        </div>

        <div className="mt-5 w-full space-y-2.5">
          {data?.map((item) => {
            const colors = PLAN_COLORS[item.plan];
            return (
              <div key={item.plan} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors?.ring ?? "#94a3b8" }} />
                  <span className="capitalize text-slate-600 dark:text-slate-300 font-medium">{item.plan}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{item.count} users</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 tabular-nums w-12 text-right">{item.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
