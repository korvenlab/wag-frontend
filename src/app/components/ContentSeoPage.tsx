import { Link } from "react-router";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SeoHead } from "../components/SeoHead";
import { SITE_ORIGIN, type SeoPageMeta } from "../lib/seoPages";
import { Button } from "../components/ui/button";

type Section = {
  heading: string;
  body: string[];
};

type FaqItem = {
  q: string;
  a: string;
};

function buildBreadcrumbList(meta: SeoPageMeta) {
  const items = [
    { name: "Início", path: "/" },
    ...(meta.breadcrumbs ?? [{ name: meta.title.split("|")[0].trim(), path: meta.path }]),
  ];

  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${item.path}`,
    })),
  };
}

export function ContentSeoPage({
  meta,
  h1,
  lead,
  sections,
  faqs,
  relatedLinks,
}: {
  meta: SeoPageMeta;
  h1: string;
  lead: string;
  sections: Section[];
  faqs: FaqItem[];
  relatedLinks?: { to: string; label: string }[];
}) {
  const url = `${SITE_ORIGIN}${meta.path}`;
  const crumbTrail = [
    { name: "Início", path: "/" },
    ...(meta.breadcrumbs ?? []),
  ];

  const jsonLd = [
    {
      "@type": "WebPage",
      name: meta.title,
      description: meta.description,
      url,
      isPartOf: { "@type": "WebSite", name: "Wagoo", url: SITE_ORIGIN },
    },
    buildBreadcrumbList(meta),
    {
      "@type": "SoftwareApplication",
      name: "Wagoo",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: SITE_ORIGIN,
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "BRL",
        lowPrice: "59",
        highPrice: "259",
        offerCount: "3",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-[var(--wagoo-paper)] text-[var(--wagoo-ink)] antialiased">
      <SeoHead meta={meta} jsonLd={jsonLd} />
      <Header />
      <main className="pt-28 pb-20 px-6">
        <article className="max-w-3xl mx-auto">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500 font-medium">
              {crumbTrail.map((item, index) => {
                const isLast = index === crumbTrail.length - 1;
                return (
                  <li key={item.path} className="flex items-center gap-1">
                    {index > 0 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden />
                    )}
                    {isLast ? (
                      <span className="text-slate-800 font-semibold" aria-current="page">
                        {item.name}
                      </span>
                    ) : (
                      <Link
                        to={item.path}
                        className="text-[#4d8f3b] hover:underline underline-offset-2"
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#4d8f3b] mb-4">
            Wagoo · Guia
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05] text-slate-900 mb-5">
            {h1}
          </h1>
          <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10">{lead}</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-14">
            <Button
              asChild
              className="h-12 px-7 rounded-2xl bg-slate-900 text-white font-bold hover:bg-[#64b34d] border border-slate-700"
            >
              <Link to="/login">
                Começar agora
                <ArrowRight className="ml-2 w-4 h-4 inline" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 px-7 rounded-2xl border-slate-300 font-bold"
            >
              <a href="/precos">Ver planos</a>
            </Button>
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
                  {section.heading}
                </h2>
                {section.body.map((p) => (
                  <p key={p.slice(0, 24)} className="text-slate-600 font-medium leading-relaxed mb-3">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>

          {relatedLinks && relatedLinks.length > 0 && (
            <section className="mt-12 pt-8 border-t border-slate-200">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mb-4">
                Continue lendo
              </h2>
              <ul className="flex flex-col sm:flex-row flex-wrap gap-3">
                {relatedLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="inline-flex items-center gap-1 text-[#4d8f3b] font-bold hover:underline underline-offset-2"
                    >
                      {link.label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-14 pt-10 border-t border-slate-200">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6">
              Perguntas frequentes
            </h2>
            <dl className="space-y-6">
              {faqs.map((item) => (
                <div key={item.q}>
                  <dt className="text-lg font-bold text-slate-900 mb-1">{item.q}</dt>
                  <dd className="text-slate-600 font-medium leading-relaxed">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <p className="mt-12 text-sm text-slate-500 font-medium">
            Voltar para a{" "}
            <Link to="/" className="text-[#4d8f3b] font-bold underline-offset-2 hover:underline">
              página inicial do Wagoo
            </Link>
            .
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
