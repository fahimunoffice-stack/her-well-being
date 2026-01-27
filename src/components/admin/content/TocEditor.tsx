import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export type TocItem = {
  title: string;
  desc: string;
};

export function TocEditor({
  value,
  onSave,
  saving,
}: {
  value: unknown;
  onSave: (next: TocItem[]) => void;
  saving?: boolean;
}) {
  const initial = useMemo<TocItem[]>(() => {
    if (!Array.isArray(value)) return [];
    return value
      .map((v: any) => ({
        title: String(v?.title ?? ""),
        desc: String(v?.desc ?? ""),
      }))
      .filter((x) => x.title || x.desc);
  }, [value]);

  const [items, setItems] = useState<TocItem[]>(initial);
  useEffect(() => setItems(initial), [initial]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Table of Contents</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setItems((p) => [...p, { title: "", desc: "" }])}
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
          <p className="text-sm text-muted-foreground">No TOC items yet.</p>
        ) : null}
        {items.map((item, idx) => (
          <div key={idx} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, title: e.target.value } : p
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={item.desc}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, desc: e.target.value } : p
                      )
                    )
                  }
                />
              </div>
            </div>
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
