import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../alert-dialog";

describe("AlertDialog", () => {
  it("opens and shows the title/description when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Delete item?</AlertDialogTitle>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    await user.click(screen.getByText("Delete"));

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Delete item?")).toBeInTheDocument();
  });

  it("calls the action handler and closes when confirmed", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Delete item?</AlertDialogTitle>
          <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByText("Confirm"));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("closes without calling the action handler when cancelled", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Delete item?</AlertDialogTitle>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    );

    await user.click(screen.getByText("Cancel"));

    expect(onAction).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
