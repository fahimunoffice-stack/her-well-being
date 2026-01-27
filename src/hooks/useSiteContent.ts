import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteContentMap = Record<string, any>;

export function useSiteContent(enabled = true) {
  return useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("*");
      if (error) throw error;
      const mapped: SiteContentMap = {};
      data?.forEach((item) => {
        mapped[item.key] = item.value;
      });
      return mapped;
    },
    enabled,
  });
}
