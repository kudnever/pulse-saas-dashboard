import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useFilterStore } from "@/stores/filterStore";
import type {
  OverviewMetrics,
  RevenueTimeseries,
  PlanDistribution,
  CountryDistribution,
} from "@dashboard/shared";

function useFilters() {
  const dateFrom = useFilterStore((s) => s.dateFrom.toISOString().split("T")[0]);
  const dateTo = useFilterStore((s) => s.dateTo.toISOString().split("T")[0]);
  const plans = useFilterStore((s) => s.plans);
  const countries = useFilterStore((s) => s.countries);
  return {
    dateFrom,
    dateTo,
    plans: plans.length ? plans : undefined,
    countries: countries.length ? countries : undefined,
  };
}

export function useOverviewMetrics() {
  const filters = useFilters();
  return useQuery({
    queryKey: ["metrics", "overview", filters.dateFrom, filters.dateTo, filters.plans, filters.countries],
    queryFn: () =>
      api.get<{ data: OverviewMetrics }>("/metrics/overview", filters as any).then((r) => r.data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useRevenueTimeseries(months = 12) {
  const filters = useFilters();
  return useQuery({
    queryKey: ["metrics", "revenue", months, filters.dateFrom, filters.dateTo],
    queryFn: () =>
      api
        .get<{ data: RevenueTimeseries[] }>("/metrics/revenue/timeseries", { months, ...filters } as any)
        .then((r) => r.data),
    staleTime: 60_000,
  });
}

export function usePlanDistribution() {
  const filters = useFilters();
  return useQuery({
    queryKey: ["metrics", "plans", filters.dateFrom, filters.dateTo],
    queryFn: () =>
      api
        .get<{ data: PlanDistribution[] }>("/metrics/distribution/plans", filters as any)
        .then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useCountryDistribution() {
  const filters = useFilters();
  return useQuery({
    queryKey: ["metrics", "countries", filters.dateFrom, filters.dateTo],
    queryFn: () =>
      api
        .get<{ data: CountryDistribution[] }>("/metrics/distribution/countries", filters as any)
        .then((r) => r.data),
    staleTime: 60_000,
  });
}
