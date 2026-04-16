import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useFilterStore } from "@/stores/filterStore";
import type { PaginatedResponse, Transaction } from "@dashboard/shared";

export function useTransactions(page = 1, pageSize = 25, type?: string) {
  const filters = useFilterStore((s) => s.toParams());
  return useQuery({
    queryKey: ["transactions", page, pageSize, type, filters],
    queryFn: () =>
      api.get<PaginatedResponse<Transaction>>("/transactions", {
        page,
        pageSize,
        type,
        ...filters,
      } as any),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
