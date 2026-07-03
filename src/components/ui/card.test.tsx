import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

describe("Card", () => {
  it("renders composed header, title, description, content, and footer", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>Review before checkout</CardDescription>
        </CardHeader>
        <CardContent>Two items in cart</CardContent>
        <CardFooter>Total: $50</CardFooter>
      </Card>
    );

    expect(screen.getByText("Order Summary")).toBeInTheDocument();
    expect(screen.getByText("Review before checkout")).toBeInTheDocument();
    expect(screen.getByText("Two items in cart")).toBeInTheDocument();
    expect(screen.getByText("Total: $50")).toBeInTheDocument();
  });

  it("merges a custom className on the root card", () => {
    render(<Card className="custom-card">Content</Card>);
    expect(screen.getByText("Content")).toHaveClass("custom-card", "rounded-lg");
  });
});
