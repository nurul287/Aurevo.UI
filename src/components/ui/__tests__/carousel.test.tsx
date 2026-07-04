import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../carousel";

describe("Carousel", () => {
  it("renders as a labeled carousel region with its slides", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
          <CarouselItem>Slide 2</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );

    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(screen.getByText("Slide 1")).toBeInTheDocument();
    expect(screen.getByText("Slide 2")).toBeInTheDocument();
    expect(screen.getAllByRole("group")).toHaveLength(2);
  });

  it("disables the previous button at the start of the carousel", () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Slide 1</CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
      </Carousel>
    );
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
  });

  it("throws when carousel subcomponents are used outside a <Carousel />", () => {
    expect(() => render(<CarouselContent />)).toThrow(
      "useCarousel must be used within a <Carousel />"
    );
  });
});
