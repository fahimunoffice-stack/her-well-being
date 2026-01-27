import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MediaUploader } from "@/components/admin/content/MediaUploader";

export type PreviewPageItem = {
  image_url: string;
};

export function PreviewPagesEditor({
  value,
  onSave,
  saving,
}: {
  value: unknown;
  onSave: (next: PreviewPageItem[]) => void;
  saving?: boolean;
}) {
  const initial = useMemo<PreviewPageItem[]>(() => {
    if (!Array.isArray(value)) return [];
    return value
      .map((v: any) => ({ image_url: String(v?.image_url ?? v ?? "") }))
      .filter((x) => x.image_url);
  }, [value]);

  const [items, setItems] = useState<PreviewPageItem[]>(initial);
  useEffect(() => setItems(initial), [initial]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Book Preview Pages</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setItems((p) => [...p, { image_url: "" }])}
          >
            Add
          </Button>
          <Button type="button" onClick={() => onSave(items)} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No preview pages yet.</p>
        ) : null}

        {items.map((item, idx) => (
          <div key={idx} className="space-y-3">
            <MediaUploader
              label={`Page ${idx + 1} image`}
              value={item.image_url}
              accept="image/*"
              saving={saving}
              onSave={(url) =>
                setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, image_url: url } : p)))
              }
            />

            <div className="flex justify-end">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
              >
                Remove
              </Button>
            </div>
            <Separator />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
