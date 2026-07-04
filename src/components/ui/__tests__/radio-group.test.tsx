import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup, RadioGroupItem } from "../radio-group";

function renderGroup(onValueChange = vi.fn(), defaultValue?: string) {
  render(
    <RadioGroup defaultValue={defaultValue} onValueChange={onValueChange}>
      <RadioGroupItem value="male" id="male" aria-label="Male" />
      <RadioGroupItem value="female" id="female" aria-label="Female" />
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  it("renders each item unchecked when there is no default value", () => {
    renderGroup();
    const radios = screen.getAllByRole("radio");
    expect(radios.every((r) => r.getAttribute("data-state") === "unchecked")).toBe(true);
  });

  it("marks the default value as checked", () => {
    renderGroup(vi.fn(), "male");
    expect(screen.getByLabelText("Male")).toHaveAttribute("data-state", "checked");
    expect(screen.getByLabelText("Female")).toHaveAttribute("data-state", "unchecked");
  });

  it("calls onValueChange and updates the checked item when selecting an option", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderGroup(onValueChange, "male");

    await user.click(screen.getByLabelText("Female"));

    expect(onValueChange).toHaveBeenCalledWith("female");
    expect(screen.getByLabelText("Female")).toHaveAttribute("data-state", "checked");
    expect(screen.getByLabelText("Male")).toHaveAttribute("data-state", "unchecked");
  });
});
