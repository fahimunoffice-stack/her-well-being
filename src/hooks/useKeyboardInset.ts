import { useEffect, useState } from "react";

/**
 * Returns an estimated bottom inset (px) when the mobile keyboard is open.
 * Uses VisualViewport when available.
 */
export function useKeyboardInset() {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // On many mobile browsers, when keyboard opens:
      // visualViewport.height shrinks while window.innerHeight stays the layout viewport.
      const raw = window.innerHeight - vv.height - vv.offsetTop;
      setInset(Math.max(0, Math.round(raw)));
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return inset;
}
