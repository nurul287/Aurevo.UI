import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

// `MessengerChat` reads VITE_FACEBOOK_PAGE_ID into a module-level constant at
// import time, so each scenario needs a fresh module registry + re-import
// after stubbing the env var. Resetting only in afterEach isn't enough — the
// very first test would still see whatever was cached before any stubbing
// (e.g. from a static top-level import), so we reset in beforeEach too and
// never statically import the module in this file.
describe("MessengerChat", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("builds an m.me URL from a page id", async () => {
    const { messengerUrl } = await import("../messenger-chat");
    expect(messengerUrl("12345")).toBe("https://m.me/12345");
  });

  it("renders nothing when VITE_FACEBOOK_PAGE_ID is not set", async () => {
    vi.stubEnv("VITE_FACEBOOK_PAGE_ID", "");
    const { MessengerChat } = await import("../messenger-chat");

    const { container } = render(
      <MemoryRouter>
        <MessengerChat />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
    vi.unstubAllEnvs();
  });

  it("renders a Messenger link when the page id is configured", async () => {
    vi.stubEnv("VITE_FACEBOOK_PAGE_ID", "12345");
    const { MessengerChat } = await import("../messenger-chat");

    render(
      <MemoryRouter>
        <MessengerChat />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("link", { name: "Message us on Messenger" }),
    ).toHaveAttribute("href", "https://m.me/12345");
    vi.unstubAllEnvs();
  });

  it("renders nothing on admin routes even when configured", async () => {
    vi.stubEnv("VITE_FACEBOOK_PAGE_ID", "12345");
    const { MessengerChat } = await import("../messenger-chat");

    const { container } = render(
      <MemoryRouter initialEntries={["/admin/products"]}>
        <MessengerChat />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
    vi.unstubAllEnvs();
  });
});
