import { useState } from "react";
import { useFilterStore } from "@/stores/filterStore";
import { subDays, subMonths, startOfMonth, startOfYear } from "date-fns";
import { Calendar, ChevronDown, Tag, Globe, X } from "lucide-react";

const DATE_PRESETS = [
  { label: "Last 7 days",    from: () => subDays(new Date(), 7),    to: () => new Date() },
  { label: "Last 30 days",   from: () => subDays(new Date(), 30),   to: () => new Date() },
  { label: "This month",     from: () => startOfMonth(new Date()), to: () => new Date() },
  { label: "Last quarter",   from: () => subMonths(new Date(), 3),  to: () => new Date() },
  { label: "Year to date",   from: () => startOfYear(new Date()),   to: () => new Date() },
];

const PLANS = ["starter", "growth", "enterprise"];
const COUNTRIES = ["US", "GB", "DE", "FR", "CA", "AU", "NL", "SE", "ES", "IT"];

function FilterButton({
  label, icon, active, onClick, badge,
}: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
        active
          ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
      }`}
    >
      <span className="text-slate-400">{icon}</span>
      <span>{label}</span>
      {badge ? <span className="bg-indigo-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">{badge}</span> : null}
      <ChevronDown size={11} className="text-slate-400 ml-0.5" />
    </button>
  );
}

function Dropdown({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute top-full mt-1.5 left-0 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 min-w-[160px] animate-slide-in-right">
      {children}
    </div>
  );
}

export function FilterBar() {
  const { dateFrom, dateTo, plans, countries, setDateRange, setPlans, setCountries, reset } =
    useFilterStore();
  const [showDate, setShowDate] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showCountry, setShowCountry] = useState(false);

  const togglePlan    = (p: string) => setPlans(plans.includes(p) ? plans.filter((x) => x !== p) : [...plans, p]);
  const toggleCountry = (c: string) => setCountries(countries.includes(c) ? countries.filter((x) => x !== c) : [...countries, c]);
  const hasFilters = plans.length > 0 || countries.length > 0;

  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const dateLabel = `${fmt(dateFrom)} – ${fmt(dateTo)}`;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Date */}
      <div className="relative">
        <FilterButton
          label={dateLabel}
          icon={<Calendar size={11} />}
          active={false}
          onClick={() => { setShowDate(!showDate); setShowPlan(false); setShowCountry(false); }}
        />
        {showDate && (
          <Dropdown>
            {DATE_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => { setDateRange(p.from(), p.to()); setShowDate(false); }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg"
              >
                {p.label}
              </button>
            ))}
          </Dropdown>
        )}
      </div>

      {/* Plan */}
      <div className="relative">
        <FilterButton
          label="Plan"
          icon={<Tag size={11} />}
          active={plans.length > 0}
          badge={plans.length || undefined}
          onClick={() => { setShowPlan(!showPlan); setShowDate(false); setShowCountry(false); }}
        />
        {showPlan && (
          <Dropdown>
            {plans.length > 0 && (
              <button onClick={() => setPlans([])} className="w-full text-left px-3 py-1.5 text-[11px] text-slate-400 hover:text-slate-600">
                Clear all
              </button>
            )}
            {PLANS.map((plan) => (
              <label key={plan} className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
                <input type="checkbox" checked={plans.includes(plan)} onChange={() => togglePlan(plan)} className="accent-indigo-500" />
                <span className="text-xs capitalize text-slate-700 dark:text-slate-200">{plan}</span>
              </label>
            ))}
          </Dropdown>
        )}
      </div>

      {/* Country */}
      <div className="relative">
        <FilterButton
          label="Country"
          icon={<Globe size={11} />}
          active={countries.length > 0}
          badge={countries.length || undefined}
          onClick={() => { setShowCountry(!showCountry); setShowDate(false); setShowPlan(false); }}
        />
        {showCountry && (
          <Dropdown>
            {countries.length > 0 && (
              <button onClick={() => setCountries([])} className="w-full text-left px-3 py-1.5 text-[11px] text-slate-400 hover:text-slate-600">
                Clear all
              </button>
            )}
            <div className="max-h-52 overflow-y-auto">
              {COUNTRIES.map((c) => (
                <label key={c} className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg">
                  <input type="checkbox" checked={countries.includes(c)} onChange={() => toggleCountry(c)} className="accent-indigo-500" />
                  <span className="text-xs text-slate-700 dark:text-slate-200">{c}</span>
                </label>
              ))}
            </div>
          </Dropdown>
        )}
      </div>

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={reset}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          <X size={11} />
          Reset
        </button>
      )}
    </div>
  );
}
