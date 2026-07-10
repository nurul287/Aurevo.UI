import { afterEach, describe, expect, it } from "vitest";
import i18n, { detectLanguage, setLanguage } from "..";

afterEach(() => {
  localStorage.removeItem("aurevo_language");
  void i18n.changeLanguage("en");
});

describe("detectLanguage", () => {
  it("prefers the user's saved choice over everything", () => {
    localStorage.setItem("aurevo_language", "bn");
    expect(detectLanguage()).toBe("bn");

    localStorage.setItem("aurevo_language", "en");
    expect(detectLanguage()).toBe("en");
  });

  it("defaults to English when nothing is saved", () => {
    expect(detectLanguage()).toBe("en");
  });

  it("ignores garbage in storage and defaults to English", () => {
    localStorage.setItem("aurevo_language", "fr");
    expect(detectLanguage()).toBe("en");
  });
});

describe("setLanguage", () => {
  it("persists the choice and switches translations", () => {
    setLanguage("bn");
    expect(localStorage.getItem("aurevo_language")).toBe("bn");
    expect(i18n.t("cart.title")).toBe("শপিং কার্ট");

    setLanguage("en");
    expect(i18n.t("cart.title")).toBe("Shopping Cart");
  });
});
