import { describe, it, expect, beforeEach } from "vitest";
import { useFilterStore } from "../stores/filterStore";

describe("filterStore", () => {
  beforeEach(() => {
    useFilterStore.getState().reset();
  });

  it("initializes with default state", () => {
    const state = useFilterStore.getState();
    expect(state.plans).toEqual([]);
    expect(state.countries).toEqual([]);
    expect(state.comparePrevious).toBe(false);
  });

  it("sets plans correctly", () => {
    useFilterStore.getState().setPlans(["starter", "growth"]);
    expect(useFilterStore.getState().plans).toEqual(["starter", "growth"]);
  });

  it("sets countries correctly", () => {
    useFilterStore.getState().setCountries(["US", "DE"]);
    expect(useFilterStore.getState().countries).toEqual(["US", "DE"]);
  });

  it("resets to initial state", () => {
    const store = useFilterStore.getState();
    store.setPlans(["enterprise"]);
    store.setCountries(["FR"]);
    store.reset();

    const after = useFilterStore.getState();
    expect(after.plans).toEqual([]);
    expect(after.countries).toEqual([]);
  });

  it("toParams serializes filters correctly", () => {
    const store = useFilterStore.getState();
    store.setPlans(["starter"]);

    const params = store.toParams();
    expect(params.plans).toEqual(["starter"]);
    expect(params.dateFrom).toBeDefined();
    expect(params.dateTo).toBeDefined();
  });

  it("toParams returns undefined for empty arrays", () => {
    const params = useFilterStore.getState().toParams();
    expect(params.plans).toBeUndefined();
    expect(params.countries).toBeUndefined();
  });
});
