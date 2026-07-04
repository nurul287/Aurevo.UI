import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";

function renderSelect(onValueChange = vi.fn()) {
  render(
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Category">
        <SelectValue placeholder="Choose a category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="shoes">Shoes</SelectItem>
        <SelectItem value="bags">Bags</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("shows the placeholder when nothing is selected", () => {
    renderSelect();
    expect(screen.getByText("Choose a category")).toBeInTheDocument();
  });

  it("opens the option list when the trigger is clicked", async () => {
    const user = userEvent.setup();
    renderSelect();

    await user.click(screen.getByRole("combobox"));

    expect(screen.getByRole("option", { name: "Shoes" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Bags" })).toBeInTheDocument();
  });

  it("calls onValueChange and shows the selected label when an option is chosen", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderSelect(onValueChange);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Bags" }));

    expect(onValueChange).toHaveBeenCalledWith("bags");
    expect(screen.getByRole("combobox")).toHaveTextContent("Bags");
  });
});
