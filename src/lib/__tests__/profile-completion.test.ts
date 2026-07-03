import { describe, expect, it } from "vitest";
import { getProfileCompletion } from "../profile-completion";
import type { UserProfile } from "@/services/types";

describe("getProfileCompletion", () => {
  it("returns 0% and 'Not started' when there is no profile", () => {
    const result = getProfileCompletion(null);
    expect(result.percent).toBe(0);
    expect(result.headline).toBe("Not started");
    expect(result.segments.every((s) => !s.done)).toBe(true);
  });

  it("returns 100% and 'Complete' when every segment is filled in", () => {
    const profile = {
      first_name: "Jane",
      last_name: "Doe",
      phone: "01700000000",
      gender: "female",
      date_of_birth: "1995-01-01",
    } as unknown as UserProfile;

    const result = getProfileCompletion(profile);
    expect(result.percent).toBe(100);
    expect(result.headline).toBe("Complete");
    expect(result.segments.every((s) => s.done)).toBe(true);
  });

  it("returns 'Almost there' when at least half the segments are done", () => {
    const profile = {
      first_name: "Jane",
      last_name: "Doe",
      phone: "01700000000",
    } as unknown as UserProfile;

    const result = getProfileCompletion(profile);
    expect(result.percent).toBe(50);
    expect(result.headline).toBe("Almost there");
    expect(result.detail).toContain("2 details left");
  });

  it("returns 'Incomplete' when fewer than half the segments are done", () => {
    const profile = { first_name: "Jane" } as unknown as UserProfile;

    const result = getProfileCompletion(profile);
    expect(result.percent).toBe(0);
    expect(result.headline).toBe("Incomplete");
  });

  it("only counts name as done when both first and last name are present", () => {
    const profile = { first_name: "Jane" } as unknown as UserProfile;
    const result = getProfileCompletion(profile);
    const nameSegment = result.segments.find((s) => s.id === "name");
    expect(nameSegment?.done).toBe(false);
  });
});
