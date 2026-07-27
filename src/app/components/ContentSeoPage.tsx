import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
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

export function ContentSeoPage({
  meta,
  h1,
  lead,
  sections,
  faqs,
}: {
  meta: SeoPageMeta;
  h1: string;
  lead: string;
  sections: Section[];
  faqs: FaqItem[];
}) {
  const url = `${SITE_ORIGIN}${meta.path}`;

  const jsonLd = [
    {
      "@type": "WebPage",
      name: meta.title,
      description: meta.description,
      url,
      isPartOf: { "@type": "WebSite", name: "Wagoo", url: SITE_ORIGIN },
    },
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
              <a href="/#precos">Ver planos</a>
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
