import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { downloadCsv } from "@/components/admin/orders/ordersCsv";
import { useOrdersPresets } from "@/components/admin/orders/useOrdersPresets";
import { BookmarkPlus, Download, Filter, Trash2 } from "lucide-react";

type Status = "pending" | "confirmed" | "rejected";

export function OrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [bulkStatus, setBulkStatus] = useState<Status>("confirmed");
  const [bulkEbookId, setBulkEbookId] = useState<string>("");

  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [notesDraft, setNotesDraft] = useState<string>("");

  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);

  const { presets, addPreset, removePreset } = useOrdersPresets();
  const [presetName, setPresetName] = useState("");

  const { data: ebookFiles = [] } = useQuery({
    queryKey: ["ebook-files"],
    queryFn: async () => {
      const { data, error } = await supabase.from("ebook_files").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const ebookById = useMemo(() => {
    const map = new Map<string, any>();
    (ebookFiles ?? []).forEach((e: any) => map.set(e.id, e));
    return map;
  }, [ebookFiles]);

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", search, statusFilter, fromDate, toDate],
    queryFn: async () => {
      let q = supabase.from("orders").select("*");
      if (statusFilter !== "all") q = q.eq("status", statusFilter);

      const s = search.trim();
      if (s) {
        q = q.or(`name.ilike.%${s}%,mobile.ilike.%${s}%,sender_bkash.ilike.%${s}%`);
      }

      if (fromDate) q = q.gte("created_at", new Date(fromDate).toISOString());
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        q = q.lte("created_at", end.toISOString());
      }

      const { data, error } = await q.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const kpis = useMemo(() => {
    const pending = orders.filter((o: any) => o.status === "pending").length;
    const confirmed = orders.filter((o: any) => o.status === "confirmed").length;
    const rejected = orders.filter((o: any) => o.status === "rejected").length;
    return { pending, confirmed, rejected, total: orders.length };
  }, [orders]);

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const payload: any = { status };
      if (status === "confirmed") payload.confirmed_at = new Date().toISOString();
      const { error } = await supabase.from("orders").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Order updated" });
    },
  });

  const updateOrderEbook = useMutation({
    mutationFn: async ({ id, ebook_file_id }: { id: string; ebook_file_id: string }) => {
      const { error } = await supabase.from("orders").update({ ebook_file_id }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Ebook assigned" });
    },
  });

  const updateOrderNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase.from("orders").update({ notes }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Notes saved" });
    },
  });

  const bulkUpdate = useMutation({
    mutationFn: async () => {
      const ids = Object.entries(selectedIds)
        .filter(([, v]) => v)
        .map(([k]) => k);
      if (ids.length === 0) throw new Error("Select at least one order");

      const payload: any = { status: bulkStatus };
      if (bulkStatus === "confirmed") payload.confirmed_at = new Date().toISOString();
      if (bulkEbookId) payload.ebook_file_id = bulkEbookId;

      const { error } = await supabase.from("orders").update(payload).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Bulk update done" });
      setSelectedIds({});
    },
    onError: (err: any) => {
      toast({ title: "Bulk update failed", description: err?.message ?? "Failed", variant: "destructive" });
    },
  });

  const deleteAllOrders = useMutation({
    mutationFn: async () => {
      // PostgREST requires a filter for DELETE; this is an always-true filter.
      const { error } = await supabase
        .from("orders")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setSelectedIds({});
      setActiveOrder(null);
      toast({ title: "Order history deleted" });
    },
    onError: (err: any) => {
      toast({
        title: "Delete failed",
        description: err?.message ?? "Failed",
        variant: "destructive",
      });
    },
  });

  const downloadOrderEbook = async (order: any) => {
    const ebookId = order.ebook_file_id as string | null;
    if (!ebookId) {
      toast({ title: "No ebook assigned", description: "Assign an ebook version first", variant: "destructive" });
      return;
    }
    const ebook = ebookById.get(ebookId);
    if (!ebook) {
      toast({ title: "Ebook not found", description: "Please re-assign the ebook", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase.storage.from("ebooks").createSignedUrl(ebook.file_path, 60);
    if (error) {
      toast({ title: "Download failed", description: error.message, variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const setQuickRange = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setFromDate(from.toISOString().slice(0, 10));
    setToDate(to.toISOString().slice(0, 10));
  };

  const selectedCount = useMemo(() => Object.values(selectedIds).filter(Boolean).length, [selectedIds]);

  const exportCsv = () => {
    const rows = orders.map((o: any) => ({
      created_at: o.created_at,
      name: o.name,
      mobile: o.mobile,
      sender_bkash: o.sender_bkash,
      status: o.status,
      notes: o.notes ?? "",
    }));
    downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const openOrder = (order: any) => {
    setActiveOrder(order);
    setNotesDraft(String(order?.notes ?? ""));
  };

  const applyPreset = (id: string) => {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    setSearch(p.search);
    setStatusFilter(p.status);
    setFromDate(p.fromDate);
    setToDate(p.toDate);
  };

  return (
    <div className="space-y-4 overflow-x-hidden md:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-semibold">{kpis.total}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-semibold">{kpis.pending}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-semibold">{kpis.confirmed}</CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-2xl font-semibold">{kpis.rejected}</CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="tracking-tight">Orders</CardTitle>
            <p className="text-sm text-muted-foreground">Search, filter, bulk update, export.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AlertDialog open={confirmDeleteAllOpen} onOpenChange={setConfirmDeleteAllOpen}>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="destructive" disabled={deleteAllOrders.isPending || orders.length === 0}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete all
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all order history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {orders.length} orders. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleteAllOrders.isPending}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteAllOrders.mutate()}
                    disabled={deleteAllOrders.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteAllOrders.isPending ? "Deleting..." : "Yes, delete all"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button type="button" variant="outline" onClick={exportCsv}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-5">
              <Label>Search</Label>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="name / mobile / sender" />
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 lg:col-span-4">
              <Label>Quick range</Label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => setQuickRange(7)}>
                  7d
                </Button>
                <Button type="button" variant="outline" onClick={() => setQuickRange(30)}>
                  30d
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFromDate("");
                    setToDate("");
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear dates
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <div className="space-y-2 lg:col-span-3">
              <Label>From</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label>To</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label>Bulk status</Label>
              <Select value={bulkStatus} onValueChange={(v: any) => setBulkStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Bulk status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirm</SelectItem>
                  <SelectItem value="rejected">Reject</SelectItem>
                  <SelectItem value="pending">Set pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label>Bulk ebook</Label>
              <Select value={bulkEbookId || "none"} onValueChange={(v) => setBulkEbookId(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ebook" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No change</SelectItem>
                  {(ebookFiles ?? []).map((e: any) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border bg-card/50 p-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Selected: {selectedCount}</Badge>
              <div className="flex items-center gap-2">
                <Input
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Save filters as..."
                  className="w-full sm:w-48"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const name = presetName.trim();
                    if (!name) return;
                    addPreset({
                      name,
                      search,
                      status: statusFilter,
                      fromDate,
                      toDate,
                    });
                    setPresetName("");
                    toast({ title: "Saved filter" });
                  }}
                >
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {presets.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => applyPreset(p.id)}>
                    {p.name}
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePreset(p.id)} aria-label={`Remove ${p.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Separator orientation="vertical" className="hidden md:block h-6" />
              <Button type="button" onClick={() => bulkUpdate.mutate()} disabled={bulkUpdate.isPending}>
                {bulkUpdate.isPending ? "Updating..." : "Apply Bulk"}
              </Button>
            </div>
          </div>

          {/* Mobile list view (better readability with keyboard + small screens) */}
          <div className="md:hidden space-y-2">
            {orders.map((order: any) => (
              <button
                key={order.id}
                type="button"
                onClick={() => openOrder(order)}
                className="w-full text-left rounded-xl border bg-card px-4 py-4 shadow-sm transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <span
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      >
                        <input
                          aria-label="select order"
                          type="checkbox"
                          checked={!!selectedIds[order.id]}
                          onChange={(e) => setSelectedIds((p) => ({ ...p, [order.id]: e.target.checked }))}
                        />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold tracking-tight text-foreground">{order.name}</div>
                        <div className="mt-1 grid gap-0.5 text-xs text-muted-foreground">
                          <div className="flex gap-2">
                            <span className="w-12 shrink-0">Mobile</span>
                            <span className="truncate text-foreground/90">{order.mobile}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="w-12 shrink-0">Sender</span>
                            <span className="truncate text-foreground/90">{order.sender_bkash}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <Badge
                      variant={
                        order.status === "confirmed"
                          ? "default"
                          : order.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("bn-BD")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  {order.status === "pending" ? (
                    <>
                      <Button size="sm" onClick={() => updateOrderStatus.mutate({ id: order.id, status: "confirmed" })}>
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateOrderStatus.mutate({ id: order.id, status: "rejected" })}
                      >
                        Reject
                      </Button>
                    </>
                  ) : null}
                  {order.status === "confirmed" ? (
                    <Button size="sm" variant="outline" onClick={() => downloadOrderEbook(order)}>
                      Download
                    </Button>
                  ) : null}
                </div>
              </button>
            ))}

            {orders.length === 0 ? (
              <div className="rounded-lg border p-4 text-sm text-muted-foreground">No orders found.</div>
            ) : null}
          </div>

          {/* Desktop/tablet table view */}
          <div className="hidden md:block max-w-full rounded-lg border overflow-hidden">
            <div className="w-full max-w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[44px]"></TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Name</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Mobile</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Sender</TableHead>
                    <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Ebook</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id} className="cursor-pointer" onClick={() => openOrder(order)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input
                          aria-label="select order"
                          type="checkbox"
                          checked={!!selectedIds[order.id]}
                          onChange={(e) => setSelectedIds((p) => ({ ...p, [order.id]: e.target.checked }))}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{order.name}</TableCell>
                      <TableCell>{order.mobile}</TableCell>
                      <TableCell>{order.sender_bkash}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "confirmed"
                              ? "default"
                              : order.status === "rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(order.created_at).toLocaleDateString("bn-BD")}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={order.ebook_file_id || "none"}
                          onValueChange={(v) => {
                            if (v === "none") return;
                            updateOrderEbook.mutate({ id: order.id, ebook_file_id: v });
                          }}
                          disabled={order.status !== "confirmed"}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={order.status === "confirmed" ? "Select ebook" : "Confirm first"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Not set</SelectItem>
                            {(ebookFiles ?? []).map((e: any) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex flex-wrap justify-end gap-2">
                          {order.status === "pending" ? (
                            <>
                              <Button size="sm" onClick={() => updateOrderStatus.mutate({ id: order.id, status: "confirmed" })}>
                                Confirm
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => updateOrderStatus.mutate({ id: order.id, status: "rejected" })}>
                                Reject
                              </Button>
                            </>
                          ) : null}
                          {order.status === "confirmed" ? (
                            <Button size="sm" variant="outline" onClick={() => downloadOrderEbook(order)}>
                              Download
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-sm text-muted-foreground">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet
        open={!!activeOrder}
        onOpenChange={(open) => {
          if (!open) setActiveOrder(null);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Order details</SheetTitle>
          </SheetHeader>

          {activeOrder ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-2">
                <div className="text-sm text-muted-foreground">Customer</div>
                <div className="text-base font-semibold">{activeOrder.name}</div>
                <div className="text-sm">{activeOrder.mobile}</div>
                <div className="text-sm text-muted-foreground">Sender</div>
                <div className="text-sm">{activeOrder.sender_bkash}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    activeOrder.status === "confirmed"
                      ? "default"
                      : activeOrder.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {activeOrder.status}
                </Badge>
                <Badge variant="outline">
                  {new Date(activeOrder.created_at).toLocaleString("bn-BD")}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} placeholder="Internal notes..." />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateOrderNotes.mutate({ id: activeOrder.id, notes: notesDraft })}
                    disabled={updateOrderNotes.isPending}
                  >
                    {updateOrderNotes.isPending ? "Saving..." : "Save notes"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => updateOrderStatus.mutate({ id: activeOrder.id, status: "confirmed" })}
                  disabled={activeOrder.status === "confirmed"}
                >
                  Confirm
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => updateOrderStatus.mutate({ id: activeOrder.id, status: "rejected" })}
                  disabled={activeOrder.status === "rejected"}
                >
                  Reject
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    updateOrderStatus.mutate({ id: activeOrder.id, status: "pending" });
                  }}
                  disabled={activeOrder.status === "pending"}
                >
                  Set pending
                </Button>
                {activeOrder.status === "confirmed" ? (
                  <Button type="button" variant="outline" onClick={() => downloadOrderEbook(activeOrder)}>
                    Download ebook
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
