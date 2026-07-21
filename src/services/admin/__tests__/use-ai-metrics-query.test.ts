import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import { useAiMetrics } from "../use-ai-metrics-query";

describe("useAiMetrics", () => {
  it("fetches AI metrics for the requested window", async () => {
    let requestedUrl = "";
    server.use(
      http.get(`${API_URL}/admin/ai-metrics`, ({ request }) => {
        requestedUrl = request.url;
        return HttpResponse.json({
          success: true,
          data: {
            range_days: 7,
            totals: {
              requests: 12,
              conversations: 5,
              input_tokens: 1000,
              output_tokens: 400,
              estimated_cost_usd: 0.003,
              avg_latency_ms: 1500,
              p95_latency_ms: 3200,
              avg_retrieval_latency_ms: 210,
              avg_retrieval_result_count: 3,
              avg_retrieval_top_score: null,
            },
            per_day: [
              { day: "2026-07-21", requests: 12, conversations: 5, input_tokens: 1000, output_tokens: 400, avg_latency_ms: 1500, p95_latency_ms: 3200 },
            ],
            tool_usage: [{ tool: "search_knowledge", count: 9 }],
          },
        });
      }),
    );

    const { result } = renderHookWithQueryClient(() => useAiMetrics(7));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(requestedUrl).toContain("days=7");
    expect(result.current.data?.totals.requests).toBe(12);
    expect(result.current.data?.tool_usage[0].tool).toBe("search_knowledge");
    expect(result.current.data?.per_day).toHaveLength(1);
  });

  it("surfaces an error when the request fails", async () => {
    server.use(
      http.get(`${API_URL}/admin/ai-metrics`, () =>
        HttpResponse.json({ success: false, error: { message: "Forbidden" } }, { status: 403 }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useAiMetrics(7));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
