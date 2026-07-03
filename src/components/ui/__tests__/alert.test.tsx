import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert, AlertDescription, AlertTitle } from "../alert";

describe("Alert", () => {
  it("renders with an alert role", () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something needs your attention.</AlertDescription>
      </Alert>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Something needs your attention.")).toBeInTheDocument();
  });

  it("applies destructive variant classes", () => {
    render(<Alert variant="destructive">Error occurred</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("text-destructive");
  });

  it("applies default variant classes", () => {
    render(<Alert>Info</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("bg-background");
  });
});
