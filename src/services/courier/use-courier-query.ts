import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { PublicTracking } from "../types";

export function usePublicTracking(trackingCode: string) {
  return useQuery({
    queryKey: ["courier", "track", trackingCode],
    queryFn: () => api.get<PublicTracking>(`/courier/track/${encodeURIComponent(trackingCode)}`),
    enabled: !!trackingCode,
    retry: false,
  });
}
