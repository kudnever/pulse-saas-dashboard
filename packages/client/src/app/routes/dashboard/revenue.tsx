import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { FilterBar } from "@/components/filters/FilterBar";

export const Route = createFileRoute("/dashboard/revenue")({
  component: RevenuePage,
});

function RevenuePage() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Revenue Analytics" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <FilterBar />
          <RevenueChart />
        </main>
      </div>
    </div>
  );
}
