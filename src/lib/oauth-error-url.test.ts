import { afterEach, describe, expect, it } from "vitest";
import {
  parseSupabaseOAuthErrorFromUrl,
  stripSupabaseOAuthParamsFromUrl,
} from "./oauth-error-url";

function setUrl(path: string) {
  window.history.pushState({}, "", path);
}

describe("parseSupabaseOAuthErrorFromUrl", () => {
  afterEach(() => {
    setUrl("/");
  });

  it("returns null when there is no error param", () => {
    setUrl("/login");
    expect(parseSupabaseOAuthErrorFromUrl()).toBeNull();
  });

  it("reads an error from the query string", () => {
    setUrl("/login?error=access_denied");
    expect(parseSupabaseOAuthErrorFromUrl()).toBe("Sign-in was cancelled.");
  });

  it("reads an error from the hash when the query string has none", () => {
    setUrl("/login#error=access_denied");
    expect(parseSupabaseOAuthErrorFromUrl()).toBe("Sign-in was cancelled.");
  });

  it("humanizes a missing-email provider error", () => {
    setUrl(
      "/login?error=server_error&error_description=" +
        encodeURIComponent("Error getting user email from external provider")
    );
    expect(parseSupabaseOAuthErrorFromUrl()).toContain("Supabase");
  });

  it("falls back to a generic message for an unknown error code", () => {
    setUrl("/login?error=weird_code");
    expect(parseSupabaseOAuthErrorFromUrl()).toBe("Sign-in failed (weird_code). Please try again.");
  });
});

describe("stripSupabaseOAuthParamsFromUrl", () => {
  afterEach(() => {
    setUrl("/");
  });

  it("removes error params from the query string", () => {
    setUrl("/login?error=access_denied&error_description=oops&foo=bar");
    stripSupabaseOAuthParamsFromUrl();

    expect(window.location.search).toBe("?foo=bar");
  });

  it("clears an error hash entirely", () => {
    setUrl("/login#error=access_denied");
    stripSupabaseOAuthParamsFromUrl();

    expect(window.location.hash).toBe("");
  });
});
