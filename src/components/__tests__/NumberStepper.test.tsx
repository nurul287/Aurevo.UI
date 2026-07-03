import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NumberStepper from "../NumberStepper";

describe("NumberStepper", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the initial value", () => {
    render(<NumberStepper value={3} onChange={vi.fn()} />);
    expect(screen.getByRole("spinbutton")).toHaveValue("3");
  });

  it("increments the value and calls onChange after the debounce delay", () => {
    const onChange = vi.fn();
    render(<NumberStepper value={1} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Increase quantity"));
    expect(screen.getByRole("spinbutton")).toHaveValue("2");
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onChange).toHaveBeenCalledWith(expect.anything(), 2);
  });

  it("decrements the value and disables further decreasing at 1", () => {
    const onChange = vi.fn();
    render(<NumberStepper value={2} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Decrease quantity"));
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onChange).toHaveBeenCalledWith(expect.anything(), 1);
    expect(screen.getByLabelText("Decrease quantity")).toBeDisabled();
  });

  it("disables the decrease button once the value reaches 1", () => {
    render(<NumberStepper value={1} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Decrease quantity")).toBeDisabled();
  });

  it("disables the increase button once maxValue is reached", () => {
    render(<NumberStepper value={5} maxValue={5} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Increase quantity")).toBeDisabled();
  });

  it("does not increase past maxValue", () => {
    const onChange = vi.fn();
    render(<NumberStepper value={5} maxValue={5} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Increase quantity"));
    expect(screen.getByRole("spinbutton")).toHaveValue("5");
  });

  it("disables all controls when disabled is true", () => {
    render(<NumberStepper value={2} onChange={vi.fn()} disabled />);

    expect(screen.getByLabelText("Increase quantity")).toBeDisabled();
    expect(screen.getByLabelText("Decrease quantity")).toBeDisabled();
    expect(screen.getByRole("spinbutton")).toBeDisabled();
  });

  it("increments on ArrowUp and decrements on ArrowDown", () => {
    const onChange = vi.fn();
    render(<NumberStepper value={2} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(screen.getByRole("spinbutton")).toHaveValue("3");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("spinbutton")).toHaveValue("1");
  });

  it("falls back to 1 when the typed value is not numeric", () => {
    render(<NumberStepper value={2} onChange={vi.fn()} />);
    const input = screen.getByRole("spinbutton");

    fireEvent.change(input, { target: { value: "abc" } });
    expect(input).toHaveValue("1");
  });

  it("syncs local value when the value prop changes externally", () => {
    const { rerender } = render(<NumberStepper value={1} onChange={vi.fn()} />);
    rerender(<NumberStepper value={7} onChange={vi.fn()} />);
    expect(screen.getByRole("spinbutton")).toHaveValue("7");
  });
});
