import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NewsletterBanner } from "../newsletter-banner";

describe("NewsletterBanner", () => {
  it("renders an email input and a YouTube subscribe link", () => {
    render(<NewsletterBanner />);
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Subscribe" })).toHaveAttribute(
      "href",
      "https://youtube.com"
    );
  });

  it("updates the email field as the user types", () => {
    render(<NewsletterBanner />);
    const input = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(input, { target: { value: "jane@example.com" } });
    expect(input).toHaveValue("jane@example.com");
  });

  it("clears the email field after submitting", () => {
    render(<NewsletterBanner />);
    const input = screen.getByPlaceholderText("Enter your email");
    fireEvent.change(input, { target: { value: "jane@example.com" } });
    fireEvent.submit(input.closest("form")!);
    expect(input).toHaveValue("");
  });
});
