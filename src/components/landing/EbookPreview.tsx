import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
 
 export const EbookPreview = () => {
  const { data: content } = useSiteContent(true);
  const pages = (Array.isArray(content?.preview_pages) ? content?.preview_pages : []) as any[];

  const resolveMedia = (value?: string) => {
    if (!value) return "";
    return value.startsWith("media/")
      ? supabase.storage.from("media").getPublicUrl(value).data.publicUrl
      : value;
  };

  const resolvedPages = useMemo(
    () =>
      pages
        .map((p) => resolveMedia(String(p?.image_url ?? p ?? "")))
        .map((u) => String(u || "").trim())
        .filter(Boolean),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pages, content?.preview_pages]
  );

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const openAt = (idx: number) => {
    setActiveIndex(Math.max(0, Math.min(idx, resolvedPages.length - 1)));
    setOpen(true);
  };

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < resolvedPages.length - 1;
  const goPrev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const goNext = () => setActiveIndex((i) => Math.min(resolvedPages.length - 1, i + 1));

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        if (canPrev) goPrev();
      }
      if (e.key === "ArrowRight") {
        if (canNext) goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, canPrev, canNext]);

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
            ই-বুকের সূচিপত্র এবং কয়েকটি পৃষ্ঠা দেখুন
         </h2>

          <p className="-mt-7 mb-10 text-center text-sm text-muted-foreground">
            পৃষ্ঠা গুলি পড়তে পৃষ্ঠার উপরে ক্লিক করুন
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {resolvedPages.map((url, idx) => {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => openAt(idx)}
                  className="text-left"
                  aria-label={`পৃষ্ঠা ${idx + 1} বড় করে দেখুন`}
                >
                  <Card className="aspect-[3/4] overflow-hidden shadow-lg hover:shadow-xl transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <PageImage src={url} alt={`ই-বুক পৃষ্ঠা ${idx + 1}`} />
                  </Card>
                </button>
              );
            })}

            {resolvedPages.length === 0 ? (
              <Card className="col-span-2 md:col-span-4 aspect-[3/4] md:aspect-auto md:h-48 overflow-hidden shadow-lg">
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">Page 1</p>
                </div>
              </Card>
            ) : null}
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-base md:text-lg">
                  ই-বুক পৃষ্ঠা {resolvedPages.length ? activeIndex + 1 : 0} / {resolvedPages.length}
                </DialogTitle>
              </DialogHeader>

              <div className="relative">
                <div className="max-h-[75svh] overflow-auto rounded-md border bg-background">
                  {resolvedPages[activeIndex] ? (
                    <img
                      src={resolvedPages[activeIndex]}
                      alt={`ই-বুক পৃষ্ঠা ${activeIndex + 1} বড় ভিউ`}
                      loading="eager"
                      decoding="async"
                      className="w-full h-auto object-contain"
                    />
                  ) : null}
                </div>

                {resolvedPages.length > 1 ? (
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Button type="button" variant="outline" onClick={goPrev} disabled={!canPrev} className="gap-2">
                      <ChevronLeft className="h-4 w-4" /> আগের পৃষ্ঠা
                    </Button>
                    <Button type="button" variant="outline" onClick={goNext} disabled={!canNext} className="gap-2">
                      পরের পৃষ্ঠা <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>

          {/* Intentionally no admin-facing instruction text on public page */}
       </div>
     </section>
   );
 };