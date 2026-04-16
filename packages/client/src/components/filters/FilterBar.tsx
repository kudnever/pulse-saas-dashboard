import { useState } from "react";
import { useFilterStore } from "@/stores/filterStore";
import { subDays, subMonths, startOfMonth, startOfYear } from "date-fns";

const DATE_PRESETS = [
  { label: "Last 7d", from: () => subDays(new Date(), 7), to: () => new Date() },
  { label: "Last 30d", from: () => subDays(new Date(), 30), to: () => new Date() },
  { label: "This Month", from: () => startOfMonth(new Date()), to: () => new Date() },
  { label: "Last Quarter", from: () => subMonths(new Date(), 3), to: () => new Date() },
  { label: "YTD", from: () => startOfYear(new Date()), to: () => new Date() },
];

const PLANS = ["starter", "growth", "enterprise"];
const COUNTRIES = ["US", "GB", "DE", "FR", "CA", "AU", "NL", "SE", "ES", "IT"];

export function FilterBar() {
  const { dateFrom, dateTo, plans, countries, setDateRange, setPlans, setCountries, reset } =
    useFilterStore();
  const [showDatePresets, setShowDatePresets] = useState(false);
  const [showPlanFilter, setShowPlanFilter] = useState(false);
  const [showCountryFilter, setShowCountryFilter] = useState(false);

  function togglePlan(plan: string) {
    setPlans(plans.includes(plan) ? plans.filter((p) => p !== plan) : [...plans, plan]);
  }

  function toggleCountry(country: string) {
    setCountries(
      countries.includes(country)
        ? countries.filter((c) => c !== country)
        : [...countries, country]
    );
  }

  const hasFilters = plans.length > 0 || countries.length > 0;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Date Range */}
      <div className="relative">
        <button
          onClick={() => setShowDatePresets(!showDatePresets)}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          📅{" "}
          {dateFrom.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
          {dateTo.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          <span className="text-gray-400">▾</span>
        </button>

        {showDatePresets && (
          <div className="absolute top-full mt-1 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 min-w-[160px]">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setDateRange(preset.from(), preset.to());
                  setShowDatePresets(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Plan Filter */}
      <div className="relative">
        <button
          onClick={() => setShowPlanFilter(!showPlanFilter)}
          className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
            plans.length > 0
              ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          } hover:bg-gray-50 dark:hover:bg-gray-700`}
        >
          🏷 Plan {plans.length > 0 && <span className="font-bold">({plans.length})</span>}
          <span className="text-gray-400">▾</span>
        </button>

        {showPlanFilter && (
          <div className="absolute top-full mt-1 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2">
            <button
              onClick={() => setPlans([])}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600"
            >
              Clear all
            </button>
            {PLANS.map((plan) => (
              <label key={plan} className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                <input
                  type="checkbox"
                  checked={plans.includes(plan)}
                  onChange={() => togglePlan(plan)}
                  className="text-brand-600"
                />
                <span className="text-sm capitalize text-gray-700 dark:text-gray-200">
                  {plan}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Country Filter */}
      <div className="relative">
        <button
          onClick={() => setShowCountryFilter(!showCountryFilter)}
          className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
            countries.length > 0
              ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          } hover:bg-gray-50 dark:hover:bg-gray-700`}
        >
          🌍 Country{" "}
          {countries.length > 0 && <span className="font-bold">({countries.length})</span>}
          <span className="text-gray-400">▾</span>
        </button>

        {showCountryFilter && (
          <div className="absolute top-full mt-1 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-2 max-h-60 overflow-y-auto">
            <button
              onClick={() => setCountries([])}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600"
            >
              Clear all
            </button>
            {COUNTRIES.map((country) => (
              <label key={country} className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                <input
                  type="checkbox"
                  checked={countries.includes(country)}
                  onChange={() => toggleCountry(country)}
                  className="text-brand-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">{country}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={reset}
          className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          🔄 Reset
        </button>
      )}
    </div>
  );
}
