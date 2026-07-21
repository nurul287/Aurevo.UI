import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAiMetrics } from "@/services/admin";
import {
  Bot,
  Clock,
  DollarSign,
  Gauge,
  MessageSquare,
  Users,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
];

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

const AdminAiMetricsPage = () => {
  const [days, setDays] = useState(7);
  const { data, isLoading, isError, error, refetch } = useAiMetrics(days);

  const totals = data?.totals;
  const perDay = data?.per_day ?? [];
  const toolUsage = data?.tool_usage ?? [];
  const maxToolCount = Math.max(1, ...toolUsage.map((t) => t.count));
  const hasActivity = (totals?.requests ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
          <p className="text-muted-foreground">
            Usage, latency, cost, and retrieval quality for the RAG chatbot.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1 self-start">
          {RANGES.map((r) => (
            <Button
              key={r.days}
              variant={days === r.days ? "default" : "ghost"}
              size="sm"
              onClick={() => setDays(r.days)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {isError && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-destructive">
              Could not load AI metrics:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversations
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(totals?.conversations ?? 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(totals?.requests ?? 0).toLocaleString()} messages
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Latency
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(totals?.avg_latency_ms ?? 0).toLocaleString()} ms
                </div>
                <p className="text-xs text-muted-foreground">
                  p95 {(totals?.p95_latency_ms ?? 0).toLocaleString()} ms
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    (totals?.input_tokens ?? 0) + (totals?.output_tokens ?? 0)
                  ).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {(totals?.input_tokens ?? 0).toLocaleString()} in ·{" "}
                  {(totals?.output_tokens ?? 0).toLocaleString()} out
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Est. Cost
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(totals?.estimated_cost_usd ?? 0).toFixed(4)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimate, model list price
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Messages per day
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : !hasActivity ? (
              <p className="text-sm text-muted-foreground py-16 text-center">
                No chat activity in this window yet.
              </p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={perDay}
                    margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--color-border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickFormatter={(d: string) => d.slice(5)}
                      stroke="var(--color-border)"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      stroke="var(--color-border)"
                    />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.5rem",
                        color: "var(--color-popover-foreground)",
                        fontSize: "0.75rem",
                      }}
                    />
                    <Bar
                      dataKey="requests"
                      name="Messages"
                      fill="var(--color-primary)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Tools & Retrieval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Tool usage
                  </p>
                  {toolUsage.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tool calls yet.</p>
                  ) : (
                    toolUsage.map((t) => (
                      <div key={t.tool} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-mono text-xs">{t.tool}</span>
                          <span className="font-medium">{t.count.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className={cn("h-2 rounded-full bg-primary")}
                            style={{ width: `${(t.count / maxToolCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2 border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Retrieval
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span>Avg results / search</span>
                    <span className="font-medium">
                      {totals?.avg_retrieval_result_count != null
                        ? totals.avg_retrieval_result_count.toFixed(1)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Avg retrieval latency</span>
                    <span className="font-medium">
                      {totals?.avg_retrieval_latency_ms != null
                        ? `${Math.round(totals.avg_retrieval_latency_ms)} ms`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Avg top score</span>
                    <span className="font-medium">
                      {totals?.avg_retrieval_top_score != null
                        ? totals.avg_retrieval_top_score.toFixed(3)
                        : "—"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAiMetricsPage;
