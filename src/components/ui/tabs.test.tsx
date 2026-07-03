import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

function renderTabs(onValueChange = vi.fn()) {
  render(
    <Tabs defaultValue="account" onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">Account settings</TabsContent>
      <TabsContent value="password">Password settings</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("shows the content for the default active tab", () => {
    renderTabs();
    expect(screen.getByText("Account settings")).toBeVisible();
    // Radix unmounts inactive tab content by default (no forceMount).
    expect(screen.queryByText("Password settings")).not.toBeInTheDocument();
  });

  it("switches content when a different tab trigger is clicked", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderTabs(onValueChange);

    await user.click(screen.getByRole("tab", { name: "Password" }));

    expect(onValueChange).toHaveBeenCalledWith("password");
    expect(screen.getByText("Password settings")).toBeVisible();
  });

  it("marks the active tab trigger with data-state=active", () => {
    renderTabs();
    expect(screen.getByRole("tab", { name: "Account" })).toHaveAttribute(
      "data-state",
      "active"
    );
    expect(screen.getByRole("tab", { name: "Password" })).toHaveAttribute(
      "data-state",
      "inactive"
    );
  });
});
