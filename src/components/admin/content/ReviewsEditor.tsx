import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MediaUploader } from "@/components/admin/content/MediaUploader";
import { useUnsavedChangesWarning } from "@/hooks/useUnsavedChangesWarning";

export type ReviewItem = {
  name: string;
  review: string;
  rating: number;
  image_url?: string;
  image_urls?: string[];
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
        image_urls: Array.isArray(v?.image_urls)
          ? (v.image_urls as any[]).map((x) => String(x)).filter(Boolean)
          : [],
      }))
      .filter((x) => x.name || x.review || x.image_url || (x.image_urls?.length ?? 0) > 0);
  }, [value]);

  const [items, setItems] = useState<ReviewItem[]>(initial);

  useEffect(() => setItems(initial), [initial]);

  const isDirty = useMemo(() => JSON.stringify(items) !== JSON.stringify(initial), [items, initial]);
  useUnsavedChangesWarning(isDirty);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="truncate">Reviews (রিভিউ)</CardTitle>
            <div className="text-xs text-muted-foreground">Add text + optional screenshots (একাধিক ছবি যোগ করা যায়)</div>
          </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setItems((prev) => [
                ...prev,
                { name: "", review: "", rating: 5, image_url: "", image_urls: [] },
              ])
            }
          >
            Add
          </Button>
          <Button type="button" onClick={() => onSave(items)} disabled={saving || !isDirty}>
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

            <div className="space-y-3">
              <MediaUploader
                label="Review Screenshot / Image (legacy single)"
                value={item.image_url ?? ""}
                accept="image/*"
                saving={saving}
                onSave={(url) =>
                  setItems((prev) => {
                    const next = prev.map((p, i) => (i === idx ? { ...p, image_url: url } : p));
                    onSave(next);
                    return next;
                  })
                }
              />

              <div className="rounded-lg border p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">Multiple screenshots</div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((p, i) =>
                          i === idx
                            ? { ...p, image_urls: [...(p.image_urls ?? []), ""] }
                            : p
                        )
                      )
                    }
                  >
                    Add image
                  </Button>
                </div>

                {(item.image_urls ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No extra images yet.</p>
                ) : null}

                {(item.image_urls ?? []).map((url, imgIdx) => (
                  <div key={imgIdx} className="space-y-2">
                    <MediaUploader
                      label={`Image ${imgIdx + 1}`}
                      value={url}
                      accept="image/*"
                      saving={saving}
                      onSave={(nextUrl) =>
                        setItems((prev) => {
                          const next = prev.map((p, i) => {
                            if (i !== idx) return p;
                            const nextUrls = [...(p.image_urls ?? [])];
                            nextUrls[imgIdx] = nextUrl;
                            return { ...p, image_urls: nextUrls };
                          });
                          onSave(next);
                          return next;
                        })
                      }
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setItems((prev) => {
                            const next = prev.map((p, i) => {
                              if (i !== idx) return p;
                              const nextUrls = (p.image_urls ?? []).filter((_, j) => j !== imgIdx);
                              return { ...p, image_urls: nextUrls };
                            });
                            onSave(next);
                            return next;
                          })
                        }
                      >
                        Remove image
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
