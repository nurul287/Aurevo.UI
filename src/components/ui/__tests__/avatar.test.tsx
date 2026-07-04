import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

describe("Avatar", () => {
  it("renders the fallback while the image has not loaded", () => {
    render(
      <Avatar>
        <AvatarImage src="https://example.com/avatar.png" alt="Jane Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    // jsdom never fires the image "load" event, so Radix keeps rendering the fallback.
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("merges a custom className on the root", () => {
    const { container } = render(<Avatar className="custom-avatar" />);
    expect(container.firstChild).toHaveClass("custom-avatar", "rounded-full");
  });
});
