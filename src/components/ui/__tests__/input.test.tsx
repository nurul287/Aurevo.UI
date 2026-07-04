import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../input";

describe("Input", () => {
  it("renders with a placeholder", () => {
    render(<Input placeholder="Email address" />);
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
  });

  it("passes the type attribute through", () => {
    render(<Input type="password" aria-label="Password" />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
  });

  it("calls onChange when the value changes", () => {
    const onChange = vi.fn();
    render(<Input aria-label="Name" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Jane" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("is disabled when the disabled prop is set", () => {
    render(<Input aria-label="Name" disabled />);
    expect(screen.getByLabelText("Name")).toBeDisabled();
  });

  it("merges a custom className", () => {
    render(<Input aria-label="Name" className="custom-input" />);
    expect(screen.getByLabelText("Name")).toHaveClass("custom-input");
  });
});
