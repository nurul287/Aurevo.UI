import { describe, expect, it } from "vitest";
import {
  BANGLADESH_DISTRICTS,
  upazilasForDistrictName,
} from "../bangladesh-locations";

describe("BANGLADESH_DISTRICTS", () => {
  it("is sorted alphabetically by English name", () => {
    const names = BANGLADESH_DISTRICTS.map((d) => d.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("contains known districts", () => {
    expect(BANGLADESH_DISTRICTS.some((d) => d.name === "Comilla")).toBe(true);
    expect(BANGLADESH_DISTRICTS.some((d) => d.name === "Dhaka")).toBe(true);
  });
});

describe("upazilasForDistrictName", () => {
  it("returns a sorted, non-empty list of upazilas for a known district", () => {
    const upazilas = upazilasForDistrictName("Comilla");
    expect(upazilas.length).toBeGreaterThan(0);
    const sorted = [...upazilas].sort((a, b) => a.localeCompare(b));
    expect(upazilas).toEqual(sorted);
  });

  it("returns an empty array for an unknown district", () => {
    expect(upazilasForDistrictName("Nowhereland")).toEqual([]);
  });
});
