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
 * Ritmo editorial: headings um pouco mais lentos; timeline/itens com stagger curto.
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
        // Flatten NodeLists — gsap.set([nl1, nl2]) treats NestedLists as invalid
        // targets and crashes with: Cannot read properties of undefined (reading 'opacity')
        const heading = gsap.utils.toArray<HTMLElement>(
          section.querySelectorAll('[data-gsap="heading"]'),
        );
        const items = gsap.utils.toArray<HTMLElement>(
          section.querySelectorAll('[data-gsap="item"]'),
        );
        const fades = gsap.utils.toArray<HTMLElement>(
          section.querySelectorAll('[data-gsap="fade"]'),
        );
        const targets = [...heading, ...items, ...fades];
        if (!targets.length) return;

        gsap.set(targets, {
          opacity: 0,
          y: 40,
          filter: "blur(5px)",
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            end: "top 24%",
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
              duration: 0.82,
              ease: "power3.out",
              stagger: 0.11,
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
              duration: 0.68,
              ease: "power3.out",
              stagger: 0.13,
            },
            heading.length ? 0.2 : 0.08,
          );
        }

        if (fades.length) {
          tl.to(
            fades,
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.9,
              ease: "power2.out",
              stagger: 0.08,
            },
            heading.length || items.length ? 0.28 : 0.1,
          );
        }
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, [rootRef, enabled]);
}
