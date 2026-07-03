import { describe, expect, it } from "vitest";
import { formatPrice, TAKA_SYMBOL } from "./currency";

describe("formatPrice", () => {
  it("formats a number with the currency symbol and 2 decimals by default", () => {
    expect(formatPrice(2450)).toBe(`${TAKA_SYMBOL}2,450.00`);
  });

  it("formats with 0 decimals when requested", () => {
    expect(formatPrice(2450, { decimals: 0 })).toBe(`${TAKA_SYMBOL}2,450`);
  });

  it("omits the symbol when showSymbol is false", () => {
    expect(formatPrice(2450, { showSymbol: false })).toBe("2,450.00");
  });

  it("parses numeric strings", () => {
    expect(formatPrice("1500.5")).toBe(`${TAKA_SYMBOL}1,500.50`);
  });

  it("falls back to 0 for null, undefined, or non-numeric input", () => {
    expect(formatPrice(null)).toBe(`${TAKA_SYMBOL}0.00`);
    expect(formatPrice(undefined)).toBe(`${TAKA_SYMBOL}0.00`);
    expect(formatPrice("not-a-number")).toBe(`${TAKA_SYMBOL}0.00`);
  });

  it("adds thousand separators for large numbers", () => {
    expect(formatPrice(1234567, { decimals: 0 })).toBe(`${TAKA_SYMBOL}1,234,567`);
  });
});
