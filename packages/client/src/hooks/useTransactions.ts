import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useFilterStore } from "@/stores/filterStore";
import type { PaginatedResponse, Transaction } from "@dashboard/shared";

export function useTransactions(page = 1, pageSize = 25, type?: string) {
  const dateFrom = useFilterStore((s) => s.dateFrom.toISOString().split("T")[0]);
  const dateTo = useFilterStore((s) => s.dateTo.toISOString().split("T")[0]);

  return useQuery({
    queryKey: ["transactions", page, pageSize, type, dateFrom, dateTo],
    queryFn: () =>
      api.get<PaginatedResponse<Transaction>>("/transactions", {
        page,
        pageSize,
        type,
        dateFrom,
        dateTo,
      } as any),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
