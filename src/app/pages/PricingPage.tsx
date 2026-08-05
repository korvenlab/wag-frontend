import { useEffect } from "react";
import { Check, Shield, Loader2, Users, MessageCircle, Link2 } from "lucide-react";
import { Link } from "react-router";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SeoHead } from "../components/SeoHead";
import { usePlanCheckout } from "../hooks/usePlanCheckout";
import {
  AGENDA_WEB_PLAN,
  WAGOO_PLAN_CARDS,
} from "../lib/wagooPlans";
import { SITE_ORIGIN, type SeoPageMeta } from "../lib/seoPages";

const SUPPORT_WHATSAPP_URL = "https://wa.me/5582999450453";

const PRECOS_SEO: SeoPageMeta = {
  path: "/precos",
  title: "Preços e planos Wagoo | Agenda Web, Basic, Pro e Pro+",
  description:
    "Compare Agenda Web, Basic, Pro e Pro+: preços, usuários e tudo o que cada plano inclui — WhatsApp com IA, Analytics, equipe e Clube.",
  ogTitle: "Preços Wagoo",
  ogDescription:
    "Agenda Web, Basic, Pro e Pro+: escolha o plano certo para o seu negócio.",
  breadcrumbs: [{ name: "Preços", path: "/precos" }],
};

/** Página pública de preços e assinatura. */
export function PricingPage() {
  const { loadingTier, checkoutError, handleCheckout } = usePlanCheckout();
  const url = `${SITE_ORIGIN}/precos`;

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (!el) return;
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, []);

  const jsonLd = [
    {
      "@type": "WebPage",
      name: PRECOS_SEO.title,
      description: PRECOS_SEO.description,
      url,
      isPartOf: { "@type": "WebSite", name: "Wagoo", url: SITE_ORIGIN },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: `${SITE_ORIGIN}/` },
        { "@type": "ListItem", position: 2, name: "Preços", item: url },
      ],
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
        lowPrice: "20",
        highPrice: "259",
        offerCount: "4",
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--wagoo-paper,#F8FAFC)]">
      <SeoHead meta={PRECOS_SEO} jsonLd={jsonLd} />
      <Header />

      <main className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
              <li>
                <Link to="/" className="hover:text-slate-900">
                  Início
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-slate-900 font-bold">Preços</li>
            </ol>
          </nav>

          <div className="max-w-3xl mb-14 space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.05]">
              Planos Wagoo
            </h1>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Escolha o que faz sentido pro seu negócio — do link de agendamento ao WhatsApp
              com IA. Sem fidelidade; cancele quando quiser.
            </p>
            {checkoutError ? (
              <p className="text-sm font-semibold text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 max-w-lg">
                {checkoutError}
              </p>
            ) : null}
          </div>

          <article
            id="agenda_web"
            className="mb-10 scroll-mt-28 rounded-[32px] border border-[#64b34d]/35 bg-white shadow-wg-elevated overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-8 md:p-10 space-y-6">
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#4d8f3b] bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                  <Link2 size={12} /> Só agendamento pelo link
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900">{AGENDA_WEB_PLAN.name}</h2>
                  <p className="text-slate-500 font-medium mt-2">{AGENDA_WEB_PLAN.description}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-slate-900">R$</span>
                  <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                    {AGENDA_WEB_PLAN.priceBrl}
                  </span>
                  <span className="text-slate-400 font-bold">/mês</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 mb-3">
                    O que inclui
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-2.5">
                    {AGENDA_WEB_PLAN.fullFeatures.map((text) => (
                      <li
                        key={text}
                        className="flex items-start gap-2 text-sm font-semibold text-slate-700"
                      >
                        <Check
                          className="w-4 h-4 text-[#64b34d] shrink-0 mt-0.5"
                          strokeWidth={3}
                        />
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="lg:w-72 p-8 md:p-10 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 bg-[var(--wagoo-paper)]">
                <button
                  type="button"
                  onClick={() => void handleCheckout(AGENDA_WEB_PLAN.tier)}
                  disabled={loadingTier !== null}
                  className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 disabled:opacity-70 bg-gradient-to-r from-[#64b34d] to-[#4d8f3b] text-white shadow-wg-green-cta"
                >
                  {loadingTier === AGENDA_WEB_PLAN.tier ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    "Assinar Agenda Web"
                  )}
                </button>
                <p className="mt-3 text-xs text-slate-500 font-medium text-center leading-relaxed">
                  Quer WhatsApp com IA depois? Assine Basic, Pro ou Pro+.
                </p>
              </div>
            </div>
          </article>

          <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-6">
            Planos com IA no WhatsApp
          </p>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {WAGOO_PLAN_CARDS.map((plan) => (
              <article
                key={plan.tier}
                id={plan.tier}
                className={
                  "relative flex flex-col scroll-mt-28 rounded-[32px] border p-8 md:p-10 bg-white shadow-wg-elevated " +
                  (plan.highlight
                    ? "border-[#64b34d] ring-2 ring-[#64b34d]/20"
                    : "border-slate-200")
                }
              >
                {plan.highlight ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Mais popular
                  </div>
                ) : null}
                <div className="mb-5">
                  <h2 className="text-2xl font-extrabold text-slate-900">{plan.name}</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">{plan.description}</p>
                </div>
                <div className="mb-6 p-5 rounded-2xl bg-[var(--wagoo-paper)] border border-slate-200">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-900">R$</span>
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                      {plan.priceBrl}
                    </span>
                    <span className="text-slate-400 font-bold">/mês</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[#4d8f3b] font-bold text-xs uppercase tracking-wider">
                    <Users size={14} /> Até {plan.maxUsers}{" "}
                    {plan.maxUsers === 1 ? "usuário" : "usuários"}
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 mb-3">
                  Incluso
                </p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.fullFeatures.map((text) => (
                    <li
                      key={text}
                      className="flex items-start gap-2.5 text-sm font-semibold text-slate-700"
                    >
                      <Check
                        className="w-4 h-4 text-[#64b34d] shrink-0 mt-0.5"
                        strokeWidth={3}
                      />
                      {text}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => void handleCheckout(plan.tier)}
                  disabled={loadingTier !== null}
                  className={
                    "w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 disabled:opacity-70 " +
                    (plan.highlight
                      ? "bg-gradient-to-r from-[#64b34d] to-[#4d8f3b] text-white shadow-wg-green-cta"
                      : "bg-slate-900 text-white hover:bg-[#64b34d]")
                  }
                >
                  {loadingTier === plan.tier ? (
                    <Loader2 className="animate-spin w-5 h-5" />
                  ) : (
                    "Assinar " + plan.name
                  )}
                </button>
              </article>
            ))}
          </div>

          <article className="mt-10 rounded-[28px] border border-slate-200 bg-slate-900 text-white shadow-wg-elevated overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8 md:px-10 md:py-9">
              <div className="space-y-2 max-w-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64b34d]">
                  Sob medida
                </p>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Plano Personalizado
                </h2>
                <p className="text-sm md:text-base text-slate-300 font-medium leading-relaxed">
                  Precisa de mais usuários ou condições especiais? Montamos a estrutura certa pro
                  seu negócio.
                </p>
              </div>
              <a
                href={SUPPORT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 shrink-0 h-14 px-8 rounded-2xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black text-base shadow-wg-green-cta transition-[background-color]"
              >
                <MessageCircle size={20} strokeWidth={2.5} />
                Entrar em contato
              </a>
            </div>
          </article>

          <p className="mt-12 flex flex-col items-center gap-2 text-center">
            <span className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              <Shield size={12} /> Pagamento seguro online
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Cancele quando quiser · Sem fidelidade
            </span>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
