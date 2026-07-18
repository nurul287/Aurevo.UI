import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { usePublicTracking } from "../use-courier-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

describe("usePublicTracking", () => {
  it("maps a successful response to status + event timeline", async () => {
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
            events: [{ status: "in_review", message: "Consignment created", event_at: "2026-01-01T00:00:00.000Z" }],
          },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => usePublicTracking("TRK-1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.courier_status).toBe("in_review");
    expect(result.current.data?.events).toHaveLength(1);
    expect(result.current.data?.events[0]?.message).toBe("Consignment created");
  });

  it("does not fire when the tracking code is empty", () => {
    const { result } = renderHookWithQueryClient(() => usePublicTracking(""));
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });

  it("surfaces a not-found error for an unknown tracking code", async () => {
    server.use(
      http.get(`${API_URL}/courier/track/does-not-exist`, () =>
        HttpResponse.json({ success: false, error: { message: "Tracking code not found" } }, { status: 404 }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => usePublicTracking("does-not-exist"));

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
