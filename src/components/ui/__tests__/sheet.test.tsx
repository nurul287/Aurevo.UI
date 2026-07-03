import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../sheet";

describe("Sheet", () => {
  it("opens and renders its content when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Sheet>
        <SheetTrigger>Open menu</SheetTrigger>
        <SheetContent>
          <SheetTitle>Navigation</SheetTitle>
        </SheetContent>
      </Sheet>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByText("Open menu"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Navigation")).toBeInTheDocument();
  });

  it("defaults to sliding in from the right", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent>
          <SheetTitle>Navigation</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByRole("dialog")).toHaveClass("inset-y-0", "right-0");
  });

  it("slides in from the left when side='left'", () => {
    render(
      <Sheet defaultOpen>
        <SheetContent side="left">
          <SheetTitle>Navigation</SheetTitle>
        </SheetContent>
      </Sheet>
    );
    expect(screen.getByRole("dialog")).toHaveClass("inset-y-0", "left-0");
  });
});
