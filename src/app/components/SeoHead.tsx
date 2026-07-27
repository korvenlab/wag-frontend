import { useEffect } from "react";
import { SITE_ORIGIN, type SeoPageMeta } from "../lib/seoPages";

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id: string, data: Record<string, unknown>) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/** Atualiza title/description/OG/canonical no client (SPA) e JSON-LD da página. */
export function SeoHead({
  meta,
  jsonLd,
}: {
  meta: SeoPageMeta;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}) {
  useEffect(() => {
    const url = `${SITE_ORIGIN}${meta.path === "/" ? "/" : meta.path}`;
    const ogTitle = meta.ogTitle ?? meta.title;
    const ogDescription = meta.ogDescription ?? meta.description;

    document.title = meta.title;
    upsertMeta("name", "description", meta.description);
    upsertLink("canonical", url);

    upsertMeta("property", "og:title", ogTitle);
    upsertMeta("property", "og:description", ogDescription);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", "Wagoo");
    upsertMeta("property", "og:locale", "pt_BR");
    upsertMeta("property", "og:image", `${SITE_ORIGIN}/og-wagoo.png`);
    upsertMeta("property", "og:image:width", "1200");
    upsertMeta("property", "og:image:height", "630");

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", ogTitle);
    upsertMeta("name", "twitter:description", ogDescription);
    upsertMeta("name", "twitter:image", `${SITE_ORIGIN}/og-wagoo.png`);

    if (jsonLd) {
      const payload = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      upsertJsonLd("wagoo-page-jsonld", {
        "@context": "https://schema.org",
        "@graph": payload,
      });
    }
  }, [meta, jsonLd]);

  return null;
}
