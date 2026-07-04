import { describe, expect, it } from "vitest";
import { formatOrderShippingLine } from "../format-order-address";

describe("formatOrderShippingLine", () => {
  it("returns an em dash when the address is missing", () => {
    expect(formatOrderShippingLine(null)).toBe("—");
    expect(formatOrderShippingLine(undefined)).toBe("—");
  });

  it("returns an em dash for non-object input", () => {
    expect(formatOrderShippingLine("123 Main St")).toBe("—");
  });

  it("joins name, address, area, and phone with a middle dot", () => {
    const line = formatOrderShippingLine({
      firstName: "Jane",
      lastName: "Doe",
      address: "House 12, Road 5",
      upazila: "Gulshan",
      district: "Dhaka",
      phone: "01700000000",
    });
    expect(line).toBe("Jane Doe · House 12, Road 5 · Gulshan, Dhaka · 01700000000");
  });

  it("skips missing fields gracefully", () => {
    const line = formatOrderShippingLine({
      firstName: "Jane",
      district: "Dhaka",
    });
    expect(line).toBe("Jane · Dhaka");
  });

  it("returns an em dash when every field is empty", () => {
    expect(formatOrderShippingLine({})).toBe("—");
  });
});
