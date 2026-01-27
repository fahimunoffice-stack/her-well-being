import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PreviewPagesEditor } from "@/components/admin/content/PreviewPagesEditor";

export function PreviewPagesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: content } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*");
      if (error) throw error;
      const mapped: Record<string, any> = {};
      data?.forEach((item) => {
        mapped[item.key] = item.value;
      });
      return mapped;
    },
  });

  const updateContent = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("site_content")
        .upsert({ key, value, updated_at: new Date().toISOString() } as any, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast({ title: "Saved" });
    },
  });

  return (
    <PreviewPagesEditor
      value={content?.preview_pages}
      saving={updateContent.isPending}
      onSave={(next) => updateContent.mutate({ key: "preview_pages", value: next })}
    />
  );
}
