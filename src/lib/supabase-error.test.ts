import { describe, expect, it } from "vitest";
import { getSupabaseErrorMessage } from "./supabase-error";

describe("getSupabaseErrorMessage", () => {
  it("returns a generic message for null or undefined", () => {
    expect(getSupabaseErrorMessage(null)).toBe("Something went wrong. Please try again.");
    expect(getSupabaseErrorMessage(undefined)).toBe(
      "Something went wrong. Please try again."
    );
  });

  it("extracts the message field from a PostgrestError-like object", () => {
    expect(getSupabaseErrorMessage({ message: "duplicate key value" })).toBe(
      "duplicate key value"
    );
  });

  it("extracts the message from a real Error instance", () => {
    expect(getSupabaseErrorMessage(new Error("Network failed"))).toBe("Network failed");
  });

  it("stringifies primitive error values", () => {
    expect(getSupabaseErrorMessage("plain string error")).toBe("plain string error");
  });

  it("stringifies the object when the message field is blank", () => {
    expect(getSupabaseErrorMessage({ message: "   " })).toBe("[object Object]");
  });

  it("falls back to a generic message for a genuinely empty error", () => {
    expect(getSupabaseErrorMessage("")).toBe("Something went wrong. Please try again.");
  });
});
