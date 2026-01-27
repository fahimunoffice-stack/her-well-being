import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCcw, Trash2 } from "lucide-react";

type MediaItem = {
  name: string;
  updated_at?: string;
  created_at?: string;
  metadata?: any;
};

function isImage(name: string) {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
}

function isVideo(name: string) {
  return /\.(mp4|webm|mov)$/i.test(name);
}

export function MediaLibrary() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["media-library"],
    queryFn: async () => {
      // MediaUploader stores under "media/<uuid>.<ext>" inside the 'media' bucket.
      const { data, error } = await supabase.storage
        .from("media")
        .list("media", { limit: 200, sortBy: { column: "updated_at", order: "desc" } });
      if (error) throw error;
      return (data ?? []) as MediaItem[];
    },
  });

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = (data ?? []).map((x) => ({ ...x, path: `media/${x.name}` }));
    if (!q) return base;
    return base.filter((x) => x.name.toLowerCase().includes(q));
  }, [data, query]);

  const copyUrl = async (path: string) => {
    const url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Copied URL" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const removeFile = async (path: string) => {
    const { error } = await supabase.storage.from("media").remove([path]);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Deleted" });
    refetch();
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Media Library</CardTitle>
          <p className="text-sm text-muted-foreground">Uploaded images/videos (bucket: media)</p>
        </div>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files..."
            className="md:w-64"
          />
          <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCcw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files found.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => {
              const publicUrl = supabase.storage.from("media").getPublicUrl(it.path).data.publicUrl;
              return (
                <div key={it.path} className="rounded-lg border bg-card overflow-hidden">
                  <div className="aspect-video bg-muted">
                    {isImage(it.name) ? (
                      <img
                        src={publicUrl}
                        alt={it.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : isVideo(it.name) ? (
                      <video src={publicUrl} className="h-full w-full object-cover" controls preload="metadata" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                        {it.name}
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="text-sm font-medium truncate" title={it.name}>
                      {it.name}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => copyUrl(it.path)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFile(it.path)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
