import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

describe("Tooltip", () => {
  it("does not show the content until the trigger is hovered", () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Helpful info</TooltipContent>
      </Tooltip>
    );
    expect(screen.queryByText("Helpful info")).not.toBeInTheDocument();
  });

  it("shows the content on hover", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Helpful info</TooltipContent>
      </Tooltip>
    );

    await user.hover(screen.getByText("Hover me"));
    await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("Helpful info"));
  });
});
