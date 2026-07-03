import { afterEach, describe, expect, it } from "vitest";
import {
  consumeOAuthLoginPending,
  markOAuthLoginPending,
  peekOAuthLoginPending,
} from "../oauth-login-flag";

describe("oauth login pending flag", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it("is false before anything is marked", () => {
    expect(peekOAuthLoginPending()).toBe(false);
  });

  it("becomes true after marking, and peek does not clear it", () => {
    markOAuthLoginPending();
    expect(peekOAuthLoginPending()).toBe(true);
    expect(peekOAuthLoginPending()).toBe(true);
  });

  it("consume returns true once and then clears the flag", () => {
    markOAuthLoginPending();
    expect(consumeOAuthLoginPending()).toBe(true);
    expect(consumeOAuthLoginPending()).toBe(false);
    expect(peekOAuthLoginPending()).toBe(false);
  });

  it("consume returns false when nothing was marked", () => {
    expect(consumeOAuthLoginPending()).toBe(false);
  });
});
