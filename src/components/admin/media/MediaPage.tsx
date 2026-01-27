import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUploader } from "@/components/admin/content/MediaUploader";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";
import { Separator } from "@/components/ui/separator";

export function MediaPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MediaUploader label="Upload image/video" value={""} accept="image/*,video/*" onSave={() => {}} />
          <p className="text-sm text-muted-foreground">Use uploads inside content editors and preview pages.</p>
        </CardContent>
      </Card>

      <Separator />
      <MediaLibrary />
    </div>
  );
}
