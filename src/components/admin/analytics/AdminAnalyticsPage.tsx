import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { addDays, format, startOfDay } from "date-fns";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Status = "pending" | "confirmed" | "rejected";

export function AdminAnalyticsPage() {
  const { data: orders = [] } = useQuery({
    queryKey: ["orders-analytics-7d"],
    queryFn: async () => {
      const from = startOfDay(addDays(new Date(), -6)).toISOString();
      const { data, error } = await supabase
        .from("orders")
        .select("created_at,status")
        .gte("created_at", from)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const series = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => startOfDay(addDays(new Date(), i - 6)));

    const base = days.map((d) => ({
      key: format(d, "yyyy-MM-dd"),
      label: format(d, "dd MMM"),
      total: 0,
      pending: 0,
      confirmed: 0,
      rejected: 0,
    }));

    const byKey = new Map(base.map((x) => [x.key, x]));
    for (const o of orders as any[]) {
      const k = format(startOfDay(new Date(o.created_at)), "yyyy-MM-dd");
      const row = byKey.get(k);
      if (!row) continue;
      row.total += 1;
      const st = (o.status as Status) ?? "pending";
      if (st === "pending") row.pending += 1;
      if (st === "confirmed") row.confirmed += 1;
      if (st === "rejected") row.rejected += 1;
    }

    return base;
  }, [orders]);

  const totals = useMemo(() => {
    return series.reduce(
      (acc, d) => {
        acc.total += d.total;
        acc.pending += d.pending;
        acc.confirmed += d.confirmed;
        acc.rejected += d.rejected;
        return acc;
      },
      { total: 0, pending: 0, confirmed: 0, rejected: 0 },
    );
  }, [series]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Last 7 days</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-semibold">{totals.total}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-semibold">{totals.pending}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-semibold">{totals.confirmed}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-semibold">{totals.rejected}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Orders trend</CardTitle>
            <p className="text-sm text-muted-foreground">Daily total (last 7 days).</p>
          </div>
          <Badge variant="secondary">7d</Badge>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} width={32} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
