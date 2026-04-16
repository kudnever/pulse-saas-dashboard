import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Transaction } from "@dashboard/shared";

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const TYPE_BADGE: Record<string, string> = {
  payment: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  upgrade: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  downgrade: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  refund: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const columnHelper = createColumnHelper<Transaction>();

const columns = [
  columnHelper.accessor("customerName", {
    header: "Customer",
    cell: (info) => (
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{info.getValue()}</p>
        <p className="text-xs text-gray-400">{info.row.original.customerEmail}</p>
      </div>
    ),
  }),
  columnHelper.accessor("plan", {
    header: "Plan",
    cell: (info) => (
      <span className="capitalize text-sm text-gray-600 dark:text-gray-300">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("amount", {
    header: "Amount",
    cell: (info) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {formatCurrency(info.getValue())} {info.row.original.currency}
      </span>
    ),
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: (info) => (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
          TYPE_BADGE[info.getValue()] ?? ""
        }`}
      >
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (info) => (
      <span className="text-sm text-gray-500">{formatDate(info.getValue())}</span>
    ),
  }),
];

export function TransactionsTable() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data, isLoading } = useTransactions(page, pageSize, typeFilter);

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: data?.totalPages ?? 1,
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Transactions
        </h2>
        <div className="flex items-center gap-3">
          <select
            value={typeFilter ?? ""}
            onChange={(e) => {
              setTypeFilter(e.target.value || undefined);
              setPage(1);
            }}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            <option value="">All Types</option>
            <option value="payment">Payment</option>
            <option value="upgrade">Upgrade</option>
            <option value="downgrade">Downgrade</option>
            <option value="refund">Refund</option>
          </select>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                      header.column.getCanSort() ? "cursor-pointer select-none" : ""
                    }`}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === "asc" ? " ↑" : ""}
                    {header.column.getIsSorted() === "desc" ? " ↓" : ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {data ? (page - 1) * pageSize + 1 : 0}–
          {data ? Math.min(page * pageSize, data.total) : 0} of {data?.total ?? 0}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            ← Prev
          </button>
          <span className="px-3 py-1.5">
            {page} / {data?.totalPages ?? 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= (data?.totalPages ?? 1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
