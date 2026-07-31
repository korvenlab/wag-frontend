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
 *
 * Importante: não usar gsap.set(opacity:0) no mount — isso escondia o conteúdo
 * até o scroll e fazia a 1ª visita parecer “lenta/vazia”. from() + immediateRender:false
 * mantém o HTML visível até o trigger.
 */
export function useLandingSectionTransitions(
  rootRef: RefObject<HTMLElement | null>,
  enabled = true,
  revision = 0,
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
        if (!heading.length && !items.length && !fades.length) return;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            toggleActions: "play none none none",
            once: true,
          },
        });

        if (heading.length) {
          tl.from(
            heading,
            {
              opacity: 0,
              y: 40,
              filter: "blur(5px)",
              duration: 0.82,
              ease: "power3.out",
              stagger: 0.11,
              immediateRender: false,
            },
            0,
          );
        }

        if (items.length) {
          tl.from(
            items,
            {
              opacity: 0,
              y: 40,
              filter: "blur(5px)",
              duration: 0.68,
              ease: "power3.out",
              stagger: 0.13,
              immediateRender: false,
            },
            heading.length ? 0.2 : 0.08,
          );
        }

        if (fades.length) {
          tl.from(
            fades,
            {
              opacity: 0,
              y: 40,
              filter: "blur(5px)",
              duration: 0.9,
              ease: "power2.out",
              stagger: 0.08,
              immediateRender: false,
            },
            heading.length || items.length ? 0.28 : 0.1,
          );
        }
      });
    }, root);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
    };
  }, [rootRef, enabled, revision]);
}
