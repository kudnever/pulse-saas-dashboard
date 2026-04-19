import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Line, Bar } from "react-chartjs-2";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { api } from "@/lib/api";
import { formatDate, formatCurrency, formatNumber } from "@/lib/formatters";
import { useRevenueTimeseries, useOverviewMetrics } from "@/hooks/useMetrics";
import type { SavedReport } from "@dashboard/shared";
import { toast } from "sonner";

const METRIC_OPTIONS = ["mrr", "active_users", "churn_rate", "net_revenue", "arpu"];

const METRIC_LABELS: Record<string, string> = {
  mrr: "MRR",
  active_users: "Active Users",
  churn_rate: "Churn Rate",
  net_revenue: "Net Revenue (30d)",
  arpu: "ARPU",
};

function ReportPreview({ config }: { config: { metrics: string[]; chartType: string } }) {
  const { data: timeseries } = useRevenueTimeseries(6);
  const { data: overview } = useOverviewMetrics();

  if (!timeseries || !overview) {
    return <div className="h-4 skeleton w-full mt-4" />;
  }

  const labels = timeseries.map((d) => d.period.slice(0, 7));
  const metric = config.metrics[0] ?? "mrr";

  const seriesData: Record<string, number[]> = {
    mrr: timeseries.map((d) => d.newMrr + d.expansionMrr - d.contractionMrr - d.churnedMrr),
    active_users: timeseries.map((_, i) => Math.round((overview.activeUsers.current * (0.7 + 0.03 * i)))),
    churn_rate: timeseries.map((_, i) => parseFloat((overview.churnRate.current - 0.1 * i).toFixed(2))),
    net_revenue: timeseries.map((d) => d.totalMrr),
    arpu: timeseries.map((d, i) => parseFloat(((d.newMrr + d.expansionMrr) / Math.max(1, 400 + i * 8)).toFixed(2))),
  };

  const values = seriesData[metric] ?? seriesData.mrr;
  const formatVal = ["mrr", "net_revenue", "arpu"].includes(metric) ? formatCurrency : formatNumber;

  const dataset = {
    label: METRIC_LABELS[metric] ?? metric,
    data: values,
    borderColor: "rgb(99,102,241)",
    backgroundColor: config.chartType === "bar" ? "rgba(99,102,241,0.7)" : "rgba(99,102,241,0.08)",
    borderWidth: 1.5,
    tension: 0.4,
    pointRadius: 2,
    fill: config.chartType === "area",
    borderRadius: config.chartType === "bar" ? 3 : undefined,
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 } as const,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${formatVal(ctx.parsed.y)}` } },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: "#94a3b8", font: { size: 10 } } },
      y: { border: { display: false }, grid: { color: "rgba(148,163,184,0.1)" }, ticks: { color: "#94a3b8", font: { size: 10 }, callback: (v: any) => formatVal(Number(v)) } },
    },
  };

  const chartData = { labels, datasets: [dataset] };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800" style={{ height: 160 }}>
      {config.chartType === "bar"
        ? <Bar data={chartData} options={commonOptions} />
        : <Line data={chartData} options={commonOptions} />}
    </div>
  );
}

export function ReportsPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["mrr"]);
  const [chartType, setChartType] = useState<"line" | "bar" | "area" | "pie">("line");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: reports, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: () => api.get<{ data: SavedReport[] }>("/reports").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      api.post("/reports", {
        name,
        config: {
          metrics: selectedMetrics,
          filters: {},
          groupBy: "month",
          dateRange: {
            from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            to: new Date().toISOString().split("T")[0],
          },
          chartType,
        },
        isShared: false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setNewName("");
      toast.success("Report saved!");
    },
    onError: () => toast.error("Failed to save report"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/reports/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setExpandedId(null);
      toast.success("Report deleted");
    },
  });

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Reports" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50 dark:bg-[#0b0f1a]">
          {/* Report Builder */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide mb-4">
              Report Builder
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Report Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Revenue Report"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Chart Type</label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as typeof chartType)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                >
                  <option value="line">Line</option>
                  <option value="bar">Bar</option>
                  <option value="area">Area</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">Metrics</label>
              <div className="flex flex-wrap gap-2">
                {METRIC_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      setSelectedMetrics((prev) =>
                        prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
                      )
                    }
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      selectedMetrics.includes(m)
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {m.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => newName && createMutation.mutate(newName)}
              disabled={!newName || createMutation.isPending}
              className="px-3 py-1.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save Report"}
            </button>
          </div>

          {/* Saved Reports */}
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Saved Reports
              </h2>
            </div>
            {isLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-4 skeleton w-full" />)}
              </div>
            ) : !reports?.length ? (
              <div className="p-12 text-center">
                <p className="text-slate-400 text-sm">No saved reports yet. Create one above.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {reports.map((report) => {
                  const cfg = report.config as { metrics: string[]; chartType: string };
                  const isOpen = expandedId === report.id;
                  return (
                    <div key={report.id} className="px-5 py-4">
                      <div className="flex items-center justify-between">
                        <button
                          className="flex items-center gap-2 flex-1 text-left group"
                          onClick={() => setExpandedId(isOpen ? null : report.id)}
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {report.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatDate(report.createdAt)} · {cfg.metrics?.join(", ")} · {cfg.chartType}
                            </p>
                          </div>
                          {isOpen ? <ChevronUp size={14} className="text-slate-400 ml-2 flex-shrink-0" /> : <ChevronDown size={14} className="text-slate-400 ml-2 flex-shrink-0" />}
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(report.id)}
                          className="text-red-500 hover:text-red-600 text-xs font-medium transition-colors ml-4"
                        >
                          Delete
                        </button>
                      </div>
                      {isOpen && <ReportPreview config={cfg} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
