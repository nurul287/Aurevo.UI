import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

// Response keys arrive snake_case — api.get converts the BE's camelCase (see
// src/lib/api.ts snakifyKeys). Mirrors Aurevo.BE getAiMetrics().
export type AiMetricsData = {
  range_days: number;
  totals: {
    requests: number;
    conversations: number;
    input_tokens: number;
    output_tokens: number;
    estimated_cost_usd: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
    avg_retrieval_latency_ms: number | null;
    avg_retrieval_result_count: number | null;
    avg_retrieval_top_score: number | null;
  };
  per_day: {
    day: string;
    requests: number;
    conversations: number;
    input_tokens: number;
    output_tokens: number;
    avg_latency_ms: number;
    p95_latency_ms: number;
  }[];
  tool_usage: { tool: string; count: number }[];
};

export function useAiMetrics(days: number) {
  return useQuery({
    queryKey: ["admin", "ai-metrics", days],
    queryFn: () => api.get<AiMetricsData>(`/admin/ai-metrics?days=${days}`),
    staleTime: 60 * 1000,
  });
}
