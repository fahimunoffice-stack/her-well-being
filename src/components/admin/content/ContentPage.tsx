import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { MediaUploader } from "@/components/admin/content/MediaUploader";
import { ReviewsEditor } from "@/components/admin/content/ReviewsEditor";
import { ReviewsSettingsEditor } from "@/components/admin/content/ReviewsSettingsEditor";
import { TocEditor } from "@/components/admin/content/TocEditor";
import { FAQEditor } from "@/components/admin/content/FAQEditor";

export function ContentPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: content } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*");
      if (error) throw error;
      const mapped: Record<string, any> = {};
      data?.forEach((item) => {
        mapped[item.key] = item.value;
      });
      return mapped;
    },
  });

  const updateContent = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, value, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast({ title: "Content updated" });
    },
  });

  const [priceDraft, setPriceDraft] = useState<string>("");
  const [bkashDraft, setBkashDraft] = useState<string>("");
  useEffect(() => {
    if (!content) return;
    setPriceDraft(String(content?.price ?? ""));
    setBkashDraft(String(content?.bkash_number ?? ""));
  }, [content]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <MediaUploader
            label="Hero Video (MP4 or URL)"
            value={content?.video_url || ""}
            accept="video/*"
            saving={updateContent.isPending}
            onSave={(url) => updateContent.mutate({ key: "video_url", value: url })}
          />

          <Separator />

          <MediaUploader
            label="Video Poster (Image or URL)"
            value={content?.video_poster || ""}
            accept="image/*"
            saving={updateContent.isPending}
            onSave={(url) => updateContent.mutate({ key: "video_poster", value: url })}
          />

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Price (BDT)</Label>
              <div className="flex gap-2">
                <Input value={priceDraft} onChange={(e) => setPriceDraft(e.target.value)} placeholder="280" />
                <Button type="button" onClick={() => updateContent.mutate({ key: "price", value: priceDraft })} disabled={updateContent.isPending}>
                  {updateContent.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>bKash Number</Label>
              <div className="flex gap-2">
                <Input value={bkashDraft} onChange={(e) => setBkashDraft(e.target.value)} placeholder="01XXXXXXXXX" />
                <Button type="button" onClick={() => updateContent.mutate({ key: "bkash_number", value: bkashDraft })} disabled={updateContent.isPending}>
                  {updateContent.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReviewsSettingsEditor
        value={content?.reviews_settings}
        saving={updateContent.isPending}
        onSave={(next) => updateContent.mutate({ key: "reviews_settings", value: next })}
      />

      <ReviewsEditor value={content?.reviews} saving={updateContent.isPending} onSave={(next) => updateContent.mutate({ key: "reviews", value: next })} />

      <TocEditor value={content?.table_of_contents} saving={updateContent.isPending} onSave={(next) => updateContent.mutate({ key: "table_of_contents", value: next })} />

      <FAQEditor value={content?.faq} saving={updateContent.isPending} onSave={(next) => updateContent.mutate({ key: "faq", value: next })} />
    </div>
  );
}
