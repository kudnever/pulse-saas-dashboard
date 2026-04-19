import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { MRRWaterfallChart } from "@/components/charts/MRRWaterfallChart";
import { FilterBar } from "@/components/filters/FilterBar";

export function RevenuePage() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Revenue Analytics" />
        <main className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50 dark:bg-[#0b0f1a]">
          <FilterBar />
          <RevenueChart />
          <MRRWaterfallChart />
        </main>
      </div>
    </div>
  );
}
