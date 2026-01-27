import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useMemo, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
 
 export const Reviews = () => {
  const { data: content } = useSiteContent(true);
  const reviews = (Array.isArray(content?.reviews) ? content?.reviews : []) as any[];

  const settings = (content?.reviews_settings ?? {}) as any;
  const autoSlideSeconds = Number(settings?.autoSlideSeconds ?? 0);
  const mobileCardsPerView = Number(settings?.mobileCardsPerView ?? 1) === 2 ? 2 : 1;

  const resolveMedia = (value?: string) => {
    if (!value) return "";
    return value.startsWith("media/")
      ? supabase.storage.from("media").getPublicUrl(value).data.publicUrl
      : value;
  };

  const normalizeImages = (review: any): string[] => {
    const fromArray = Array.isArray(review?.image_urls)
      ? (review.image_urls as any[]).map((x) => String(x)).filter(Boolean)
      : [];
    const single = review?.image_url ? [String(review.image_url)] : [];
    const merged = [...fromArray, ...single].filter(Boolean);
    // de-dupe while preserving order
    const seen = new Set<string>();
    return merged.filter((u) => {
      const key = String(u);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const ReviewImage = ({ src, alt }: { src: string; alt: string }) => {
    const [loaded, setLoaded] = useState(false);

    return (
      <div className="relative mb-4 overflow-hidden rounded-lg border bg-muted">
        {/* Blur/skeleton placeholder */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-muted ${loaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        />
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-gradient-to-br from-muted to-secondary/40 ${loaded ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
        />

        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={
            `w-full h-auto object-contain transition-all duration-500 ` +
            (loaded ? "blur-0 scale-100" : "blur-md scale-[1.01]")
          }
        />
      </div>
    );
  };

  const ReviewCard = ({ review }: { review: any }) => {
    const images = useMemo(() => normalizeImages(review).map(resolveMedia).filter(Boolean), [review]);

    return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow w-full max-w-md">
      <CardContent className="p-6">
        {images.length > 0 ? (
          <div className="mb-4">
            {images.length === 1 ? (
              <ReviewImage
                src={images[0]}
                alt={`রিভিউ স্ক্রিনশট - ${String(review?.name ?? "")}`}
              />
            ) : (
              <Carousel opts={{ align: "start" }} className="relative">
                <CarouselContent>
                  {images.map((src, i) => (
                    <CarouselItem key={i} className="basis-full">
                      <ReviewImage
                        src={src}
                        alt={`রিভিউ স্ক্রিনশট ${i + 1} - ${String(review?.name ?? "")}`}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
                <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
              </Carousel>
            )}
          </div>
        ) : null}

        <div className="flex gap-1 mb-3">
          {[...Array(Math.max(1, Math.min(5, Number(review.rating ?? 5))))].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-primary text-primary" />
          ))}
        </div>
        <p className="text-muted-foreground italic mb-3">"{review.review}"</p>
        <p className="font-semibold text-foreground">— {review.name}</p>
      </CardContent>
    </Card>
    );
  };

  const [api, setApi] = useState<CarouselApi | null>(null);
  const shouldAutoSlide = Number.isFinite(autoSlideSeconds) && autoSlideSeconds > 0;

  useEffect(() => {
    if (!api || !shouldAutoSlide) return;
    const ms = Math.max(1200, Math.round(autoSlideSeconds * 1000));
    const id = window.setInterval(() => {
      // loop-ish: if can't go next, go back to start
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, ms);
    return () => window.clearInterval(id);
  }, [api, shouldAutoSlide, autoSlideSeconds]);
 
   return (
     <section className="py-12 md:py-16 bg-secondary/30">
       <div className="container mx-auto px-4">
         <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-foreground">
           পাঠকদের রিভিউ
         </h2>
          {reviews.length === 0 ? (
            <Card className="max-w-6xl mx-auto">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                রিভিউ শীঘ্রই যোগ করা হবে।
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile: swipe carousel */}
              <div className="lg:hidden max-w-6xl mx-auto">
                <Carousel opts={{ align: "start" }} setApi={setApi} className="relative">
                  <CarouselContent>
                    {reviews.map((review, idx) => (
                      <CarouselItem
                        key={idx}
                        className={mobileCardsPerView === 2 ? "basis-1/2" : "basis-full"}
                      >
                        <div className="flex justify-center">
                          <ReviewCard review={review} />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
                  <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
                </Carousel>
              </div>

              {/* Desktop: grid */}
              <div className="hidden lg:grid gap-6 max-w-6xl mx-auto lg:grid-cols-3 justify-items-center">
                {reviews.map((review, idx) => (
                  <ReviewCard key={idx} review={review} />
                ))}
              </div>
            </>
          )}
       </div>
     </section>
   );
 };