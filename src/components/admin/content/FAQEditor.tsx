import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export type FAQItem = {
  question: string;
  answer: string;
};

export function FAQEditor({
  value,
  onSave,
  saving,
}: {
  value: unknown;
  onSave: (next: FAQItem[]) => void;
  saving?: boolean;
}) {
  const initial = useMemo<FAQItem[]>(() => {
    if (!Array.isArray(value)) return [];
    return value
      .map((v: any) => ({
        question: String(v?.question ?? ""),
        answer: String(v?.answer ?? ""),
      }))
      .filter((x) => x.question || x.answer);
  }, [value]);

  const [items, setItems] = useState<FAQItem[]>(initial);
  useEffect(() => setItems(initial), [initial]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>FAQ</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setItems((p) => [...p, { question: "", answer: "" }])}
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
          <p className="text-sm text-muted-foreground">No FAQ items yet.</p>
        ) : null}
        {items.map((item, idx) => (
          <div key={idx} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={item.question}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, question: e.target.value } : p
                      )
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Answer</Label>
                <Input
                  value={item.answer}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((p, i) =>
                        i === idx ? { ...p, answer: e.target.value } : p
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
