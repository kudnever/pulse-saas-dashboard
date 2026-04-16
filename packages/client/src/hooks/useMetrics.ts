import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useFilterStore } from "@/stores/filterStore";
import type {
  OverviewMetrics,
  RevenueTimeseries,
  PlanDistribution,
  CountryDistribution,
} from "@dashboard/shared";

export function useOverviewMetrics() {
  const filters = useFilterStore((s) => s.toParams());
  return useQuery({
    queryKey: ["metrics", "overview", filters],
    queryFn: () =>
      api.get<{ data: OverviewMetrics }>("/metrics/overview", filters as any).then((r) => r.data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useRevenueTimeseries(months = 12) {
  const filters = useFilterStore((s) => s.toParams());
  return useQuery({
    queryKey: ["metrics", "revenue", months, filters],
    queryFn: () =>
      api
        .get<{ data: RevenueTimeseries[] }>("/metrics/revenue/timeseries", {
          months,
          ...filters,
        } as any)
        .then((r) => r.data),
    staleTime: 60_000,
  });
}

export function usePlanDistribution() {
  const filters = useFilterStore((s) => s.toParams());
  return useQuery({
    queryKey: ["metrics", "plans", filters],
    queryFn: () =>
      api
        .get<{ data: PlanDistribution[] }>("/metrics/distribution/plans", filters as any)
        .then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useCountryDistribution() {
  const filters = useFilterStore((s) => s.toParams());
  return useQuery({
    queryKey: ["metrics", "countries", filters],
    queryFn: () =>
      api
        .get<{ data: CountryDistribution[] }>("/metrics/distribution/countries", filters as any)
        .then((r) => r.data),
    staleTime: 60_000,
  });
}
