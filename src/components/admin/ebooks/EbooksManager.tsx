import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type EbookFileRow = {
  id: string;
  title: string;
  file_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export function EbooksManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const canUpload = title.trim().length > 0 && !!file;

  const { data: ebooks = [] } = useQuery({
    queryKey: ["ebook-files"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ebook_files")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EbookFileRow[];
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${crypto.randomUUID()}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("ebooks")
        .upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from("ebook_files").insert({
        title: title.trim(),
        file_path: path,
        mime_type: file.type || null,
        size_bytes: file.size ?? null,
      });
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ebook-files"] });
      toast({ title: "Ebook uploaded" });
      setTitle("");
      setFile(null);
    },
    onError: (err: any) => {
      toast({
        title: "Upload failed",
        description: err?.message ?? "Could not upload ebook",
        variant: "destructive",
      });
    },
  });

  const download = async (row: EbookFileRow) => {
    const { data, error } = await supabase.storage
      .from("ebooks")
      .createSignedUrl(row.file_path, 60);
    if (error) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const totalSize = useMemo(() => {
    return ebooks.reduce((sum, e) => sum + (e.size_bytes ?? 0), 0);
  }, [ebooks]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload new ebook version</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>PDF File</Label>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <p className="text-xs text-muted-foreground">Selected: {file.name}</p>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            onClick={() => uploadMutation.mutate()}
            disabled={!canUpload || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ebook versions ({ebooks.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Total uploaded size: {Math.round(totalSize / 1024 / 1024)} MB
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ebooks.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.title}</TableCell>
                  <TableCell>
                    {new Date(e.created_at).toLocaleDateString("bn-BD")}
                  </TableCell>
                  <TableCell>
                    {e.size_bytes ? Math.round(e.size_bytes / 1024 / 1024) + " MB" : "—"}
                  </TableCell>
                  <TableCell>
                    <Button type="button" size="sm" onClick={() => download(e)}>
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {ebooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    No ebook uploaded yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
