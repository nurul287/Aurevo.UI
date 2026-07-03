import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContactUsSection } from "../contact-us-section";

describe("ContactUsSection", () => {
  it("renders all form fields", () => {
    render(<ContactUsSection />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("updates field values as the user types", () => {
    render(<ContactUsSection />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Hello there" },
    });

    expect(screen.getByLabelText("Name")).toHaveValue("Jane");
    expect(screen.getByLabelText("Message")).toHaveValue("Hello there");
  });

  it("submits without throwing", () => {
    render(<ContactUsSection />);
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "Send" }))
    ).not.toThrow();
  });
});
