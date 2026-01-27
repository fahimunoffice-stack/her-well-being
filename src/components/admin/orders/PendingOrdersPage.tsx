import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

type Status = "pending" | "confirmed" | "rejected";

function statusLabelBn(status: Status) {
  if (status === "pending") return "Pending (পেন্ডিং)";
  if (status === "confirmed") return "Confirmed (কনফার্ম)";
  return "Rejected (রিজেক্ট)";
}

export function PendingOrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", "pending-only"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const payload: any = { status };
      if (status === "confirmed") payload.confirmed_at = new Date().toISOString();
      const { error } = await supabase.from("orders").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Updated" });
    },
    onError: (err: any) => {
      toast({
        title: "Update failed",
        description: err?.message ?? "Failed",
        variant: "destructive",
      });
    },
  });

  const count = useMemo(() => orders.length, [orders.length]);

  return (
    <div className="space-y-4 overflow-x-hidden md:space-y-6">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <CardTitle className="tracking-tight">Pending Orders (পেন্ডিং)</CardTitle>
            <p className="text-sm text-muted-foreground">
              শুধু pending অর্ডার — ভুল কমানোর জন্য বড় Confirm বাটন।
            </p>
          </div>
          <Badge variant="secondary">Total: {count}</Badge>
        </CardHeader>

        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">Loading…</div>
          ) : null}

          {!isLoading && orders.length === 0 ? (
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">No pending orders.</div>
          ) : null}

          <div className="space-y-2">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="rounded-xl border bg-card px-4 py-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold tracking-tight text-foreground">
                      {order.name}
                    </div>
                    <div className="mt-1 grid gap-0.5 text-xs text-muted-foreground">
                      <div className="flex gap-2">
                        <span className="w-14 shrink-0">Mobile</span>
                        <span className="truncate text-foreground/90">{order.mobile}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-14 shrink-0">Sender</span>
                        <span className="truncate text-foreground/90">{order.sender_bkash}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <Badge variant="secondary">{statusLabelBn("pending")}</Badge>
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("bn-BD")}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button
                    size="lg"
                    className="h-12"
                    onClick={() => updateOrderStatus.mutate({ id: order.id, status: "confirmed" })}
                    disabled={updateOrderStatus.isPending}
                  >
                    Confirm (কনফার্ম)
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-12 w-12" aria-label="More">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateOrderStatus.mutate({ id: order.id, status: "rejected" })}
                      >
                        Reject (রিজেক্ট)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
