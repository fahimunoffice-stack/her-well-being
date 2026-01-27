import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
  }
}

function normalizePixelId(value: unknown): string {
  const raw = String(value ?? "").trim();
  // Pixel ID is numeric; keep only digits so users can paste with spaces.
  return raw.replace(/\D/g, "");
}

export function MetaPixel() {
  const location = useLocation();
  const { data: content } = useSiteContent(true);

  const pixelId = useMemo(() => normalizePixelId((content as any)?.meta_pixel_id), [content]);

  // 1) Load + init once whenever pixelId changes
  useEffect(() => {
    if (!pixelId) return;
    if (typeof window === "undefined") return;

    // Avoid double-inject.
    if (document.getElementById("meta-pixel-script")) {
      // If script already present, ensure init happened.
      try {
        window.fbq?.("init", pixelId);
      } catch {
        // ignore
      }
      return;
    }

    // Meta Pixel base code (script injection)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = (f.fbq = function () {
        // eslint-disable-next-line prefer-rest-params
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.id = "meta-pixel-script";
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    try {
      window.fbq?.("init", pixelId);
      window.fbq?.("track", "PageView");
    } catch {
      // ignore
    }
  }, [pixelId]);

  // 2) Track SPA route changes
  useEffect(() => {
    if (!pixelId) return;
    try {
      window.fbq?.("track", "PageView");
    } catch {
      // ignore
    }
  }, [pixelId, location.pathname, location.search]);

  return null;
}
