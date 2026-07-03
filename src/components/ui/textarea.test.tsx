import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders with a placeholder", () => {
    render(<Textarea placeholder="Write a note" />);
    expect(screen.getByPlaceholderText("Write a note")).toBeInTheDocument();
  });

  it("calls onChange when typed into", () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="Note" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Note"), { target: { value: "Hello" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Textarea aria-label="Note" disabled />);
    expect(screen.getByLabelText("Note")).toBeDisabled();
  });
});
