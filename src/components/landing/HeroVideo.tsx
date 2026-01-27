 import { useMemo, useRef, useState } from "react";
 import { ChevronUp, Play } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { useSiteContent } from "@/hooks/useSiteContent";

function getYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    // youtu.be/<id>
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      // youtube.com/watch?v=<id>
      const v = u.searchParams.get("v");
      if (v) return v;

      // youtube.com/embed/<id> or /shorts/<id>
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
  } catch {
    // ignore
  }
  return null;
}

 
 export const HeroVideo = () => {
   const { data: content } = useSiteContent(true);
   const [isPlaying, setIsPlaying] = useState(false);
  const [pendingNativePlay, setPendingNativePlay] = useState(false);
  const nativeVideoRef = useRef<HTMLVideoElement | null>(null);
 
   const videoUrl = content?.video_url || "";
   const posterUrl = content?.video_poster || "";

   // Convert storage paths to public URLs (memoized to avoid repeated work)
   const resolvedVideoUrl = useMemo(() => {
     if (!videoUrl) return "";
     return videoUrl.startsWith("media/")
       ? supabase.storage.from("media").getPublicUrl(videoUrl).data.publicUrl
       : videoUrl;
   }, [videoUrl]);

   const resolvedPosterUrl = useMemo(() => {
     if (!posterUrl) return "";
     return posterUrl.startsWith("media/")
       ? supabase.storage.from("media").getPublicUrl(posterUrl).data.publicUrl
       : posterUrl;
   }, [posterUrl]);

   const youtubeId = typeof resolvedVideoUrl === "string" ? getYouTubeVideoId(resolvedVideoUrl) : null;

   // Force 16:9 for consistent hero layout
   const aspectRatio = 16 / 9;
 
   const youtubeThumbUrl = useMemo(() => {
     if (!youtubeId) return "";
     // Lightweight preview image; loads much faster than the full player.
     return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
   }, [youtubeId]);

   // We only create the iframe after a user click, so we can request sound (mute=0).
   // If a specific device/browser still blocks it, user can unmute from the player UI.
   const youtubeEmbedUrl = youtubeId
     ? `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&autoplay=1&mute=0`
     : null;

  const startNativePlayback = () => {
    setIsPlaying(true);
    setPendingNativePlay(true);
    // iOS/Android sometimes require the play() call to be tied to the user gesture.
    // We try immediately (next frame) and also retry on onCanPlay.
    requestAnimationFrame(() => {
      const el = nativeVideoRef.current;
      if (!el) return;
      el.muted = false;
      try {
        el.volume = 1;
      } catch {
        // ignore
      }
      const p = el.play();
      if (p && typeof (p as any).catch === "function") {
        (p as Promise<void>).catch(() => {
          // ignore; user can press play from controls if browser blocks it
        });
      }
    });
  };
 
   return (
    <section className="relative w-full bg-gradient-to-b from-secondary to-background py-8 md:py-20">
       <div className="container mx-auto px-4">
         {/* Video */}
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-2xl">
            {youtubeEmbedUrl ? (
              isPlaying ? (
                <iframe
                  className="w-full aspect-video"
                  src={youtubeEmbedUrl}
                  title="YouTube video player"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="group relative block w-full aspect-video"
                  aria-label="ভিডিও প্লে করুন"
                >
                   {youtubeThumbUrl ? (
                    <img
                      src={youtubeThumbUrl}
                      alt="ভিডিও থাম্বনেইল"
                       loading="eager"
                      decoding="async"
                       fetchPriority="high"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                  <div className="absolute inset-0 bg-foreground/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 shadow-lg backdrop-blur transition-transform group-hover:scale-[1.02]">
                      <Play className="h-5 w-5 text-primary" />
                      <span className="text-sm md:text-base font-semibold text-foreground">ভিডিও দেখুন</span>
                    </div>
                  </div>
                </button>
              )
             ) : resolvedVideoUrl ? (
              isPlaying ? (
                <video
                   ref={nativeVideoRef}
                  controls
                  poster={resolvedPosterUrl}
                  preload="metadata"
                  autoPlay
                  playsInline
                   onCanPlay={() => {
                     if (!pendingNativePlay) return;
                     const el = nativeVideoRef.current;
                     if (!el) return;
                     el.muted = false;
                     try {
                       el.volume = 1;
                     } catch {
                       // ignore
                     }
                     const p = el.play();
                     if (p && typeof (p as any).catch === "function") {
                       (p as Promise<void>).catch(() => {
                         // ignore
                       });
                     }
                     setPendingNativePlay(false);
                   }}
                  className="w-full aspect-video object-contain"
                >
                  <source src={resolvedVideoUrl} type="video/mp4" />
                  আপনার ব্রাউজার ভিডিও সাপোর্ট করে না।
                </video>
              ) : (
                <button
                  type="button"
                   onClick={startNativePlayback}
                  className="group relative block w-full aspect-video"
                  aria-label="ভিডিও প্লে করুন"
                >
                   {resolvedPosterUrl ? (
                    <img
                      src={resolvedPosterUrl}
                      alt="ভিডিও পোস্টার"
                       loading="eager"
                      decoding="async"
                       fetchPriority="high"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                  <div className="absolute inset-0 bg-foreground/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2 shadow-lg backdrop-blur transition-transform group-hover:scale-[1.02]">
                      <Play className="h-5 w-5 text-primary" />
                      <span className="text-sm md:text-base font-semibold text-foreground">ভিডিও দেখুন</span>
                    </div>
                  </div>
                </button>
              )
            ) : (
              <div className="w-full aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">ভিডিও লোড হচ্ছে...</p>
              </div>
            )}
          </div>
 
         {/* "video টি দেখুন" with arrows */}
        <div className="mt-4 md:mt-6 flex items-center justify-center gap-3">
           <ChevronUp className="h-5 w-5 text-primary animate-bounce" />
          <p className="text-base md:text-xl font-semibold text-foreground">
             video টি দেখুন
           </p>
           <ChevronUp className="h-5 w-5 text-primary animate-bounce" />
         </div>
       </div>
     </section>
   );
 };