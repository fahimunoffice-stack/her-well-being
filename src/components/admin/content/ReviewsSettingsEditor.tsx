import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type ReviewsSettings = {
  autoSlideSeconds: number; // 0 = off
  mobileCardsPerView: 1 | 2;
};

function clampSeconds(v: number) {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(120, Math.round(v)));
}

export function ReviewsSettingsEditor({
  value,
  onSave,
  saving,
}: {
  value: unknown;
  onSave: (next: ReviewsSettings) => void;
  saving?: boolean;
}) {
  const initial = useMemo<ReviewsSettings>(() => {
    const v = (value ?? {}) as any;
    const autoSlideSeconds = clampSeconds(Number(v?.autoSlideSeconds ?? 0));
    const mobileCardsPerView = Number(v?.mobileCardsPerView ?? 1) === 2 ? 2 : 1;
    return { autoSlideSeconds, mobileCardsPerView };
  }, [value]);

  const [draft, setDraft] = useState<ReviewsSettings>(initial);
  useEffect(() => setDraft(initial), [initial]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Reviews Settings</CardTitle>
        <Button type="button" onClick={() => onSave(draft)} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>Auto slide (seconds) — 0 = off</Label>
          <Input
            type="number"
            min={0}
            max={120}
            value={draft.autoSlideSeconds}
            onChange={(e) =>
              setDraft((p) => ({ ...p, autoSlideSeconds: clampSeconds(Number(e.target.value)) }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Mobile layout</Label>
          <RadioGroup
            value={String(draft.mobileCardsPerView)}
            onValueChange={(v) =>
              setDraft((p) => ({ ...p, mobileCardsPerView: v === "2" ? 2 : 1 }))
            }
            className="grid gap-2"
          >
            <Label className="flex items-center gap-2 font-normal">
              <RadioGroupItem value="1" />
              Show 1 card per view
            </Label>
            <Label className="flex items-center gap-2 font-normal">
              <RadioGroupItem value="2" />
              Show 2 cards per view
            </Label>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
