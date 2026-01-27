import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
 
 export const EbookPreview = () => {
  const { data: content } = useSiteContent(true);
  const pages = (Array.isArray(content?.preview_pages) ? content?.preview_pages : []) as any[];

  const resolveMedia = (value?: string) => {
    if (!value) return "";
    return value.startsWith("media/")
      ? supabase.storage.from("media").getPublicUrl(value).data.publicUrl
      : value;
  };

  const PageImage = ({ src, alt }: { src: string; alt: string }) => {
    const [loaded, setLoaded] = useState(false);
    return (
      <div className="relative w-full h-full">
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-muted ${loaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        />
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-contain transition-all duration-500 ${
            loaded ? "blur-0 scale-100" : "blur-md scale-[1.02]"
          }`}
        />
      </div>
    );
  };
 
   return (
     <section className="py-12 md:py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
         <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-foreground">
           ই-বুকের কয়েকটি পৃষ্ঠা
         </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {pages.map((p, idx) => {
              const url = resolveMedia(String(p?.image_url ?? p ?? ""));
              if (!url) return null;
              return (
                <Card
                  key={idx}
                  className="aspect-[3/4] overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <PageImage src={url} alt={`ই-বুক প্রিভিউ পৃষ্ঠা ${idx + 1}`} />
                </Card>
              );
            })}

            {pages.length === 0 ? (
              <Card className="col-span-2 md:col-span-4 aspect-[3/4] md:aspect-auto md:h-48 overflow-hidden shadow-lg">
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Page 1</p>
                </div>
              </Card>
            ) : null}
          </div>

          {/* Intentionally no admin-facing instruction text on public page */}
       </div>
     </section>
   );
 };