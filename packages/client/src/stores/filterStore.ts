import { create } from "zustand";
import { subDays } from "date-fns";

export interface FilterState {
  dateFrom: Date;
  dateTo: Date;
  plans: string[];
  countries: string[];
  segments: string[];
  comparePrevious: boolean;

  setDateRange: (from: Date, to: Date) => void;
  setPlans: (plans: string[]) => void;
  setCountries: (countries: string[]) => void;
  setSegments: (segments: string[]) => void;
  setComparePrevious: (enabled: boolean) => void;
  reset: () => void;
  toParams: () => Record<string, string | string[] | undefined>;
}

const initialState = {
  dateFrom: subDays(new Date(), 30),
  dateTo: new Date(),
  plans: [] as string[],
  countries: [] as string[],
  segments: [] as string[],
  comparePrevious: false,
};

export const useFilterStore = create<FilterState>()((set, get) => ({
  ...initialState,

  setDateRange: (dateFrom, dateTo) => set({ dateFrom, dateTo }),
  setPlans: (plans) => set({ plans }),
  setCountries: (countries) => set({ countries }),
  setSegments: (segments) => set({ segments }),
  setComparePrevious: (comparePrevious) => set({ comparePrevious }),

  reset: () => set(initialState),

  toParams: () => {
    const s = get();
    return {
      dateFrom: s.dateFrom.toISOString().split("T")[0],
      dateTo: s.dateTo.toISOString().split("T")[0],
      plans: s.plans.length ? s.plans : undefined,
      countries: s.countries.length ? s.countries : undefined,
    };
  },
}));
