import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible";

describe("Collapsible", () => {
  it("hides content by default", () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden details</CollapsibleContent>
      </Collapsible>
    );
    // Radix unmounts the content entirely while collapsed.
    expect(screen.queryByText("Hidden details")).not.toBeInTheDocument();
  });

  it("reveals content when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden details</CollapsibleContent>
      </Collapsible>
    );

    await user.click(screen.getByText("Toggle"));
    expect(screen.getByText("Hidden details")).toBeVisible();
  });

  it("starts open when defaultOpen is true", () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden details</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByText("Hidden details")).toBeVisible();
  });
});
