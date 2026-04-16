import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from "../lib/formatters";

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    expect(formatCurrency(1234)).toBe("$1,234");
    expect(formatCurrency(45230)).toBe("$45,230");
    expect(formatCurrency(0)).toBe("$0");
  });

  it("handles large numbers", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000");
  });

  it("formats negative values", () => {
    const result = formatCurrency(-500);
    expect(result).toContain("500");
  });
});

describe("formatNumber", () => {
  it("formats with commas", () => {
    expect(formatNumber(1247)).toBe("1,247");
    expect(formatNumber(1000000)).toBe("1,000,000");
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatPercent", () => {
  it("adds + sign for positive values", () => {
    expect(formatPercent(12.5)).toBe("+12.5%");
  });

  it("no + sign for negative values", () => {
    expect(formatPercent(-3.2)).toBe("-3.2%");
  });

  it("respects decimal precision", () => {
    expect(formatPercent(5.678, 2)).toBe("+5.68%");
  });
});

describe("formatRelativeTime", () => {
  it("shows 'just now' for very recent times", () => {
    const now = new Date().toISOString();
    expect(formatRelativeTime(now)).toBe("just now");
  });

  it("shows minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fiveMinAgo)).toBe("5m ago");
  });

  it("shows hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(twoHoursAgo)).toBe("2h ago");
  });

  it("shows days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(threeDaysAgo)).toBe("3d ago");
  });
});
