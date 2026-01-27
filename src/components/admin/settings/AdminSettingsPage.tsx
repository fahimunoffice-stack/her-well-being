import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";

export function AdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: content } = useSiteContent(true);

  const [priceDraft, setPriceDraft] = useState("");
  const [bkashDraft, setBkashDraft] = useState("");
  const [videoUrlDraft, setVideoUrlDraft] = useState("");
  const [posterDraft, setPosterDraft] = useState("");
  const [metaPixelDraft, setMetaPixelDraft] = useState("");

  useEffect(() => {
    if (!content) return;
    setPriceDraft(String(content?.price ?? ""));
    setBkashDraft(String(content?.bkash_number ?? ""));
    setVideoUrlDraft(String(content?.video_url ?? ""));
    setPosterDraft(String(content?.video_poster ?? ""));
    setMetaPixelDraft(String((content as any)?.meta_pixel_id ?? ""));
  }, [content]);

  const updateContent = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, value, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast({ title: "Saved" });
    },
    onError: (err: any) => {
      toast({ title: "Save failed", description: err?.message ?? "Failed", variant: "destructive" });
    },
  });

  const saveAll = async () => {
    await Promise.all([
      updateContent.mutateAsync({ key: "price", value: priceDraft }),
      updateContent.mutateAsync({ key: "bkash_number", value: bkashDraft }),
      updateContent.mutateAsync({ key: "video_url", value: videoUrlDraft }),
      updateContent.mutateAsync({ key: "video_poster", value: posterDraft }),
      updateContent.mutateAsync({ key: "meta_pixel_id", value: metaPixelDraft.trim() }),
    ]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Settings</CardTitle>
          <Button onClick={saveAll} disabled={updateContent.isPending}>
            {updateContent.isPending ? "Saving..." : "Save all"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Price (BDT)</Label>
              <Input value={priceDraft} onChange={(e) => setPriceDraft(e.target.value)} placeholder="280" />
            </div>
            <div className="space-y-2">
              <Label>bKash Number</Label>
              <Input value={bkashDraft} onChange={(e) => setBkashDraft(e.target.value)} placeholder="01XXXXXXXXX" />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Hero Video (MP4 URL / YouTube)</Label>
              <Input value={videoUrlDraft} onChange={(e) => setVideoUrlDraft(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Video Poster (Image URL)</Label>
              <Input value={posterDraft} onChange={(e) => setPosterDraft(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Meta Pixel ID</Label>
              <Input
                value={metaPixelDraft}
                onChange={(e) => setMetaPixelDraft(e.target.value)}
                placeholder="1234567890"
              />
              <p className="text-xs text-muted-foreground">
                Add your Meta Pixel ID to enable PageView tracking on all pages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
