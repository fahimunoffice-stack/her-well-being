import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MediaUploader } from "@/components/admin/content/MediaUploader";

export type ReviewItem = {
  name: string;
  review: string;
  rating: number;
  image_url?: string;
};

function clampRating(v: number) {
  if (Number.isNaN(v)) return 5;
  return Math.max(1, Math.min(5, Math.round(v)));
}

export function ReviewsEditor({
  value,
  onSave,
  saving,
}: {
  value: unknown;
  onSave: (next: ReviewItem[]) => void;
  saving?: boolean;
}) {
  const initial = useMemo<ReviewItem[]>(() => {
    if (!Array.isArray(value)) return [];
    return value
      .map((v: any) => ({
        name: String(v?.name ?? ""),
        review: String(v?.review ?? ""),
        rating: clampRating(Number(v?.rating ?? 5)),
        image_url: String(v?.image_url ?? ""),
      }))
      .filter((x) => x.name || x.review || x.image_url);
  }, [value]);

  const [items, setItems] = useState<ReviewItem[]>(initial);

  useEffect(() => setItems(initial), [initial]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Reviews</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setItems((prev) => [...prev, { name: "", review: "", rating: 5, image_url: "" }])
            }
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
          <p className="text-sm text-muted-foreground">No reviews yet.</p>
        ) : null}
        {items.map((item, idx) => (
          <div key={idx} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2 md:col-span-1">
                <Label>Name</Label>
                <Input
                  value={item.name}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, name: e.target.value } : p
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label>Rating (1-5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={item.rating}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) =>
                        i === idx
                          ? { ...p, rating: clampRating(Number(e.target.value)) }
                          : p
                      )
                    )
                  }
                />
              </div>
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() =>
                    setItems((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  Remove
                </Button>
              </div>
            </div>

            <MediaUploader
              label="Review Screenshot / Image"
              value={item.image_url ?? ""}
              accept="image/*"
              saving={saving}
              onSave={(url) =>
                setItems((prev) => {
                  const next = prev.map((p, i) =>
                    i === idx ? { ...p, image_url: url } : p
                  );
                  // Auto-save when image changes so it shows on the landing page immediately.
                  onSave(next);
                  return next;
                })
              }
            />

            <div className="space-y-2">
              <Label>Review</Label>
              <Input
                value={item.review}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((p, i) =>
                      i === idx ? { ...p, review: e.target.value } : p
                    )
                  )
                }
              />
            </div>
            <Separator />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
