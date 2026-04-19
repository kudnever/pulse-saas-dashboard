import { useOverviewMetrics, usePlanDistribution } from "@/hooks/useMetrics";
import { formatCurrency } from "@/lib/formatters";
import { Sparkles, TrendingUp, AlertTriangle, Heart, Users, Trophy } from "lucide-react";

interface Insight {
  icon: React.ReactNode;
  title: string;
  body: string;
  type: "positive" | "warning" | "neutral";
}

function generateInsights(
  metrics: { mrr?: { current: number; change: number }; churnRate?: { current: number; change: number }; activeUsers?: { current: number; change: number } } | undefined,
  plans: { plan: string; mrr: number; percentage: number; count: number }[] | undefined
): Insight[] {
  const insights: Insight[] = [];
  if (!metrics) return [];

  const mrr = metrics.mrr;
  const churn = metrics.churnRate;
  const users = metrics.activeUsers;

  if (mrr) {
    if (mrr.change > 5) {
      insights.push({
        icon: <TrendingUp size={13} />,
        title: "Strong MRR Growth",
        body: `Revenue grew ${mrr.change.toFixed(1)}% reaching ${formatCurrency(mrr.current)}. Momentum is building.`,
        type: "positive",
      });
    } else if (mrr.change < -3) {
      insights.push({
        icon: <AlertTriangle size={13} />,
        title: "Revenue Declining",
        body: `MRR dropped ${Math.abs(mrr.change).toFixed(1)}%. Consider reviewing recent churn and pricing.`,
        type: "warning",
      });
    } else {
      insights.push({
        icon: <TrendingUp size={13} />,
        title: "Stable Revenue Base",
        body: `MRR at ${formatCurrency(mrr.current)} with ${mrr.change > 0 ? "+" : ""}${mrr.change.toFixed(1)}% change. Good baseline.`,
        type: "neutral",
      });
    }
  }

  if (churn) {
    if (churn.current > 5) {
      insights.push({
        icon: <AlertTriangle size={13} />,
        title: "High Churn Alert",
        body: `Churn at ${churn.current.toFixed(1)}% exceeds 5% threshold. Investigate cancellation patterns.`,
        type: "warning",
      });
    } else if (churn.current < 2) {
      insights.push({
        icon: <Heart size={13} />,
        title: "Excellent Retention",
        body: `${churn.current.toFixed(1)}% churn is best-in-class. Your product stickiness is a competitive moat.`,
        type: "positive",
      });
    }
  }

  if (users && users.change > 0) {
    insights.push({
      icon: <Users size={13} />,
      title: "User Growth",
      body: `Active users up ${users.change.toFixed(1)}% to ${users.current.toLocaleString()}. Acquisition is working.`,
      type: "positive",
    });
  }

  if (plans && plans.length > 0) {
    const top = plans.reduce((a, b) => (a.mrr > b.mrr ? a : b));
    insights.push({
      icon: <Trophy size={13} />,
      title: `${top.plan.charAt(0).toUpperCase() + top.plan.slice(1)} Leads Revenue`,
      body: `${top.plan} drives ${top.percentage}% of MRR (${formatCurrency(top.mrr)}). Target upsells for smaller tiers.`,
      type: "neutral",
    });
  }

  return insights.slice(0, 4);
}

const typeStyles = {
  positive: "border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10",
  warning:  "border-amber-500/20  bg-amber-500/5  dark:bg-amber-500/10",
  neutral:  "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50",
};

const iconStyles = {
  positive: "text-emerald-500",
  warning:  "text-amber-500",
  neutral:  "text-slate-400",
};

export function AIInsightsPanel() {
  const { data: metrics, isLoading: ml } = useOverviewMetrics();
  const { data: plans,   isLoading: pl } = usePlanDistribution();

  const insights = generateInsights(metrics as any, plans);

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
        <Sparkles size={14} className="text-indigo-500" />
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">AI Insights</h2>
        <span className="ml-auto text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
          Auto
        </span>
      </div>

      <div className="p-4 space-y-2.5">
        {(ml || pl) ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-lg" />
          ))
        ) : insights.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Load data to generate insights.</p>
        ) : (
          insights.map((insight, i) => (
            <div key={i} className={`rounded-lg border p-3.5 ${typeStyles[insight.type]}`}>
              <div className={`flex items-center gap-1.5 mb-1 font-semibold text-xs ${iconStyles[insight.type]}`}>
                {insight.icon}
                <span className="text-slate-800 dark:text-slate-200 font-semibold text-[13px]">{insight.title}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{insight.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
