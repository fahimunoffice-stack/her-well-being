import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

type OrderRow = Tables<"orders">;

export function AdminLogsPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      setSessionEmail(session?.user?.email ?? null);

      const { data, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (ordersError) throw ordersError;
      setOrders(data ?? []);
    } catch (e: any) {
      console.error("AdminLogsPage load failed", e);
      setError("ডাটা লোড করা যাচ্ছে না।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const confirmed = orders.filter((o) => o.status === "confirmed").length;
    return { total, pending, confirmed };
  }, [orders]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-foreground">Logs</h2>
          <p className="text-sm text-muted-foreground">Recent activity + system/session info</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total (last 50)</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{stats.total}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{stats.pending}</CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">{stats.confirmed}</CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent orders</CardTitle>
              {loading ? <span className="text-xs text-muted-foreground">Loading…</span> : null}
            </CardHeader>
            <CardContent>
              {error ? <p className="text-sm text-muted-foreground">{error}</p> : null}
              {!error && !loading && orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data.</p>
              ) : null}

              <div className="space-y-2">
                {orders.map((o) => (
                  <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">{o.name}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {o.mobile} • {new Date(o.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Status: {o.status}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Email: </span>
                <span className="text-foreground">{sessionEmail ?? "(not available)"}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Full admin audit logs (who did what) যোগ করতে চাইলে আমরা backend এ event store করবো।
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
