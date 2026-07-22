import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

function ensureGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/**
 * Troca de seções na landing com GSAP ScrollTrigger.
 * Use `data-gsap-section` na section e `data-gsap="heading|item|fade"` nos filhos.
 */
export function useLandingSectionTransitions(
  rootRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled || !rootRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    ensureGsap();
    const root = rootRef.current;

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-gsap-section]", root);

      sections.forEach((section) => {
        const heading = section.querySelectorAll<HTMLElement>('[data-gsap="heading"]');
        const items = section.querySelectorAll<HTMLElement>('[data-gsap="item"]');
        const fades = section.querySelectorAll<HTMLElement>('[data-gsap="fade"]');

        gsap.set([heading, items, fades], {
          opacity: 0,
          y: 48,
          filter: "blur(6px)",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 84%",
            end: "top 22%",
            toggleActions: "play none none reverse",
          },
        });

        if (heading.length) {
          tl.to(
            heading,
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.75,
              ease: "power3.out",
              stagger: 0.09,
            },
            0,
          );
        }

        if (items.length) {
          tl.to(
            items,
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.7,
              ease: "power3.out",
              stagger: 0.11,
            },
            heading.length ? 0.16 : 0.06,
          );
        }

        if (fades.length) {
          tl.to(
            fades,
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.85,
              ease: "power2.out",
              stagger: 0.07,
            },
            0.1,
          );
        }
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, [rootRef, enabled]);
}
