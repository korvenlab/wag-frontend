import { useEffect } from "react";

/** Bloqueia scroll do body (overlays mobile). Só ativo abaixo do breakpoint informado. */
export function useBodyScrollLock(locked: boolean, maxWidthPx = 1023) {
  useEffect(() => {
    if (!locked) return;
    if (typeof window === "undefined") return;
    if (window.innerWidth > maxWidthPx) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked, maxWidthPx]);
}
