import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Link as LinkIcon, X, Image as ImageIcon, Film } from "lucide-react";

type MediaItem = {
  name: string;
  updated_at?: string;
  created_at?: string;
  metadata?: any;
};

function extFromMime(mime?: string) {
  const m = (mime ?? "").toLowerCase();
  if (m === "image/jpeg" || m === "image/jpg") return "jpg";
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  if (m === "image/gif") return "gif";
  if (m === "video/mp4") return "mp4";
  if (m === "video/webm") return "webm";
  if (m === "video/quicktime") return "mov";
  return "bin";
}

function isImage(name: string) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
}

function isVideo(name: string) {
  return /\.(mp4|webm|mov)$/i.test(name);
}

type MediaUploaderProps = {
  label: string;
  value: string;
  accept?: string;
  onSave: (url: string) => void;
  saving?: boolean;
};

export function MediaUploader({
  label,
  value,
  accept = "image/*,video/*",
  onSave,
  saving,
}: MediaUploaderProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  // Keep the URL input in sync when parent value changes (e.g. after refresh / query loads)
  useEffect(() => {
    setUrlInput(value || "");
  }, [value]);

  const isStoragePath = !!value && value.startsWith("media/");
  const currentUrl = useMemo(() => {
    if (!value) return "";
    return isStoragePath
      ? supabase.storage.from("media").getPublicUrl(value).data.publicUrl
      : value;
  }, [value, isStoragePath]);

  const handleFileUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const rawExt = file.name.includes(".") ? file.name.split(".").pop() : "";
      const ext = (rawExt && rawExt.length <= 8 ? rawExt : "") || extFromMime(file.type);
      const path = `media/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      onSave(path);
      setFile(null);
      toast({ title: "Uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error?.message || "Try again",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSave = () => {
    if (!urlInput.trim()) {
      toast({ title: "Enter a URL", variant: "destructive" });
      return;
    }

    onSave(urlInput.trim());
    toast({ title: "URL saved" });
  };

  const acceptsImages = /image\//i.test(accept) || /\bimage\b/i.test(accept);
  const acceptsVideos = /video\//i.test(accept) || /\bvideo\b/i.test(accept);

  const previewKind = useMemo<"image" | "video" | null>(() => {
    if (!currentUrl) return null;
    // Prefer accept-based detection (works even when filenames have no extension)
    if (acceptsImages && !acceptsVideos) return "image";
    if (acceptsVideos && !acceptsImages) return "video";

    // Fallback: extension detection from URL
    if (currentUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|#|$)/i)) return "image";
    if (currentUrl.match(/\.(mp4|webm|mov)(\?|#|$)/i)) return "video";
    return null;
  }, [currentUrl, acceptsImages, acceptsVideos]);

  const { data: libraryItems, isFetching: isLibraryFetching, refetch: refetchLibrary } = useQuery({
    queryKey: ["media-library-picker", accept],
    enabled: libraryOpen,
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("media")
        .list("media", { limit: 200, sortBy: { column: "updated_at", order: "desc" } });
      if (error) throw error;
      return (data ?? []) as MediaItem[];
    },
  });

  const filteredLibrary = useMemo(() => {
    const base = (libraryItems ?? []).map((x) => ({ ...x, path: `media/${x.name}` }));
    return base.filter((x) => {
      if (acceptsImages && isImage(x.name)) return true;
      if (acceptsVideos && isVideo(x.name)) return true;
      if (!acceptsImages && !acceptsVideos) return true;
      return false;
    });
  }, [libraryItems, acceptsImages, acceptsVideos]);

  const handleRemove = async () => {
    if (isStoragePath) {
      await supabase.storage.from("media").remove([value]);
    }
    onSave("");
    setUrlInput("");
    toast({ title: "Removed" });
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {currentUrl && (
        <Card className="p-3 relative">
          <div className="flex items-start gap-3">
            {previewKind === "image" ? (
              <img src={currentUrl} alt="Preview" className="w-32 h-32 object-contain rounded bg-muted" />
            ) : previewKind === "video" ? (
              <video src={currentUrl} className="w-32 h-32 object-contain rounded bg-muted" controls />
            ) : null}
            <div className="flex-1 text-sm text-muted-foreground break-all">
              {isStoragePath ? "Uploaded file" : currentUrl}
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={handleRemove}
              disabled={saving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url">
            <LinkIcon className="h-4 w-4 mr-2" />
            Use URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <Input type="file" accept={accept} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {file && <p className="text-xs text-muted-foreground">Selected: {file.name}</p>}
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={handleFileUpload} disabled={!file || uploading || saving}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>

            <Dialog open={libraryOpen} onOpenChange={setLibraryOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" disabled={saving}>
                  {(acceptsVideos && !acceptsImages) ? <Film className="h-4 w-4 mr-2" /> : <ImageIcon className="h-4 w-4 mr-2" />}
                  Choose from library
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Select from Media Library</DialogTitle>
                </DialogHeader>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    Select an existing file from storage (won't re-upload).
                  </p>
                  <Button type="button" variant="outline" onClick={() => refetchLibrary()} disabled={isLibraryFetching}>
                    Refresh
                  </Button>
                </div>

                {filteredLibrary.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No matching files found.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-h-[60vh] overflow-auto pr-1">
                    {filteredLibrary.map((it) => {
                      const publicUrl = supabase.storage.from("media").getPublicUrl(it.path).data.publicUrl;
                      return (
                        <button
                          key={it.path}
                          type="button"
                          onClick={() => {
                            onSave(it.path);
                            setLibraryOpen(false);
                            toast({ title: "Selected" });
                          }}
                          className="text-left rounded-lg border bg-card overflow-hidden hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <div className="aspect-video bg-muted">
                            {isImage(it.name) ? (
                              <img src={publicUrl} alt={it.name} loading="lazy" className="h-full w-full object-cover" />
                            ) : isVideo(it.name) ? (
                              <video src={publicUrl} className="h-full w-full object-cover" controls preload="metadata" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">{it.name}</div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="text-sm font-medium truncate" title={it.name}>
                              {it.name}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <Input
            placeholder="https://example.com/file.mp4"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <Button type="button" onClick={handleUrlSave} disabled={saving}>
            Save URL
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
