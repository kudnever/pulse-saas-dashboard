import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
import type { SavedReport } from "@dashboard/shared";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["mrr"]);
  const [chartType, setChartType] = useState<"line" | "bar" | "area" | "pie">("line");

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
      toast.success("Report deleted");
    },
  });

  const METRIC_OPTIONS = ["mrr", "active_users", "churn_rate", "net_revenue", "arpu"];

  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Reports" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Report Builder */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Report Builder
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Report Name
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Revenue Report"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chart Type
                </label>
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as typeof chartType)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="line">Line</option>
                  <option value="bar">Bar</option>
                  <option value="area">Area</option>
                  <option value="pie">Pie</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Metrics
              </label>
              <div className="flex flex-wrap gap-2">
                {METRIC_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() =>
                      setSelectedMetrics((prev) =>
                        prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedMetrics.includes(m)
                        ? "bg-brand-600 text-white"
                        : "border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save Report"}
            </button>
          </div>

          {/* Saved Reports */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Saved Reports
              </h2>
            </div>
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            ) : !reports?.length ? (
              <div className="p-12 text-center text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p>No saved reports yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{report.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(report.createdAt)} •{" "}
                        {(report.config as any).metrics?.join(", ")}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(report.id)}
                      className="text-sm text-red-500 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
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
