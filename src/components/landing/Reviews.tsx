 import { Card, CardContent } from "@/components/ui/card";
 import { Star } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
 
 export const Reviews = () => {
  const { data: content } = useSiteContent(true);
  const reviews = (Array.isArray(content?.reviews) ? content?.reviews : []) as any[];

  const resolveMedia = (value?: string) => {
    if (!value) return "";
    return value.startsWith("media/")
      ? supabase.storage.from("media").getPublicUrl(value).data.publicUrl
      : value;
  };

  const ReviewImage = ({ src, alt }: { src: string; alt: string }) => {
    const [loaded, setLoaded] = useState(false);

    return (
      <div className="relative mb-4 overflow-hidden rounded-lg border">
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
          className={`w-full h-52 object-cover transition-all duration-500 ${
            loaded ? "blur-0 scale-100" : "blur-md scale-[1.02]"
          }`}
        />
      </div>
    );
  };

  const ReviewCard = ({ review }: { review: any }) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow w-full max-w-md">
      <CardContent className="p-6">
        {review?.image_url ? (
          <ReviewImage
            src={resolveMedia(String(review.image_url))}
            alt={`রিভিউ স্ক্রিনশট - ${String(review?.name ?? "")}`}
          />
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
                <Carousel opts={{ align: "start" }} className="relative">
                  <CarouselContent>
                    {reviews.map((review, idx) => (
                      <CarouselItem key={idx} className="basis-full sm:basis-1/2">
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