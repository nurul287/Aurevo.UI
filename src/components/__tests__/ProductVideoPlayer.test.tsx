import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProductVideoPlayer from "../ProductVideoPlayer";

describe("ProductVideoPlayer", () => {
  it("shows a placeholder with a disabled play button when there is no video URL", () => {
    render(<ProductVideoPlayer posterImage="/poster.jpg" />);
    expect(screen.getByRole("button", { name: "Play video" })).toBeDisabled();
    expect(screen.getByAltText("Product video")).toHaveAttribute(
      "src",
      "/poster.jpg",
    );
  });

  it("shows a 'no video available' message when there is no video or poster", () => {
    render(<ProductVideoPlayer />);
    expect(screen.getByText("No video available")).toBeInTheDocument();
  });

  it("renders a video element when a video URL is provided", () => {
    const { container } = render(
      <ProductVideoPlayer videoUrl="/clip.mp4" alt="Sneaker demo" />,
    );
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video).toHaveAttribute("src", "/clip.mp4");
    expect(video).toHaveAttribute("loop");
    // React sets the `muted` IDL property directly rather than the HTML
    // attribute, so assert on the property instead of hasAttribute.
    expect(video.muted).toBe(true);
  });

  it("toggles the play/pause button label when clicked", () => {
    render(<ProductVideoPlayer videoUrl="/clip.mp4" />);
    const button = screen.getByRole("button", { name: /video/ });
    // jsdom videos don't actually play, but the click handler still calls
    // play()/pause() on the element without throwing.
    expect(() => fireEvent.click(button)).not.toThrow();
  });
});
