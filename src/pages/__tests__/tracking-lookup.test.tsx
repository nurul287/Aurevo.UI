import { http, HttpResponse } from "msw";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { TrackingLookup } from "../shop-help-pages";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

describe("TrackingLookup", () => {
  it("renders status and event timeline on a successful lookup", async () => {
    server.use(
      http.get(`${API_URL}/courier/track/TRK-1`, () =>
        HttpResponse.json({
          success: true,
          data: {
            tracking_code: "TRK-1",
            provider: "steadfast",
            courier_status: "in_review",
            order_status: "shipped",
            estimated_delivery_date: null,
            events: [
              { status: "in_review", message: "Consignment created", event_at: "2026-01-01T00:00:00.000Z" },
            ],
          },
        }),
      ),
    );

    renderWithProviders(<TrackingLookup />);

    await userEvent.type(screen.getByLabelText("Tracking code"), "TRK-1");
    await userEvent.click(screen.getByRole("button", { name: "Track" }));

    await waitFor(() => expect(screen.getAllByText("in_review").length).toBeGreaterThan(0));
    expect(screen.getByText("Consignment created")).toBeInTheDocument();
  });

  it("shows a not-found message for an unknown tracking code", async () => {
    server.use(
      http.get(`${API_URL}/courier/track/does-not-exist`, () =>
        HttpResponse.json({ success: false, error: { message: "Tracking code not found" } }, { status: 404 }),
      ),
    );

    renderWithProviders(<TrackingLookup />);

    await userEvent.type(screen.getByLabelText("Tracking code"), "does-not-exist");
    await userEvent.click(screen.getByRole("button", { name: "Track" }));

    await waitFor(() =>
      expect(screen.getByText(/We couldn't find a parcel with that tracking code/)).toBeInTheDocument(),
    );
  });

  it("disables the Track button until a code is entered", () => {
    renderWithProviders(<TrackingLookup />);
    expect(screen.getByRole("button", { name: "Track" })).toBeDisabled();
  });

  it("does not perform a lookup before the form is submitted", () => {
    renderWithProviders(<TrackingLookup />);
    expect(screen.queryByText("Looking up your parcel...")).not.toBeInTheDocument();
  });
});
