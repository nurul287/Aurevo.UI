import { describe, expect, it } from "vitest";
import { buildProfileFieldsFromUserMetadata } from "./profile-from-auth-metadata";

describe("buildProfileFieldsFromUserMetadata", () => {
  it("uses direct first_name / last_name fields when present", () => {
    const result = buildProfileFieldsFromUserMetadata({
      first_name: "Jane",
      last_name: "Doe",
    });
    expect(result).toEqual({ first_name: "Jane", last_name: "Doe", avatar_url: undefined });
  });

  it("falls back to Google's given_name / family_name", () => {
    const result = buildProfileFieldsFromUserMetadata({
      given_name: "John",
      family_name: "Smith",
    });
    expect(result.first_name).toBe("John");
    expect(result.last_name).toBe("Smith");
  });

  it("splits a full_name into first and last name when no direct fields exist", () => {
    const result = buildProfileFieldsFromUserMetadata({ full_name: "Alice Wonderland" });
    expect(result.first_name).toBe("Alice");
    expect(result.last_name).toBe("Wonderland");
  });

  it("treats a single-word name as first name only", () => {
    const result = buildProfileFieldsFromUserMetadata({ name: "Madonna" });
    expect(result.first_name).toBe("Madonna");
    expect(result.last_name).toBeUndefined();
  });

  it("returns only avatar_url when there is no name information", () => {
    const result = buildProfileFieldsFromUserMetadata({ avatar_url: "https://example.com/a.png" });
    expect(result).toEqual({ avatar_url: "https://example.com/a.png" });
  });

  it("prefers avatar_url over picture", () => {
    const result = buildProfileFieldsFromUserMetadata({
      full_name: "Jane Doe",
      avatar_url: "https://example.com/avatar.png",
      picture: "https://example.com/picture.png",
    });
    expect(result.avatar_url).toBe("https://example.com/avatar.png");
  });

  it("falls back to picture when avatar_url is absent", () => {
    const result = buildProfileFieldsFromUserMetadata({
      full_name: "Jane Doe",
      picture: "https://example.com/picture.png",
    });
    expect(result.avatar_url).toBe("https://example.com/picture.png");
  });
});
