import { useRef } from "react";

/** Seção de valor — narrativa + conta rápida, sem grid de ícones. */
export function InvestmentSection() {
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      id="investimento"
      ref={ref}
      data-gsap-section
      className="relative py-28 md:py-36 overflow-hidden bg-[var(--wagoo-night)] text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #64b34d 0%, transparent 42%), radial-gradient(circle at 80% 70%, #1d4ed8 0%, transparent 38%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-start">
          <div className="space-y-7 max-w-xl">
            <h2
              data-gsap="heading"
              className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[0.95]"
            >
              Menos tempo no WhatsApp.
              <span className="block text-[#64b34d]">Mais tempo no que paga a conta.</span>
            </h2>

            <div className="space-y-5 text-base md:text-lg text-slate-300 font-medium leading-relaxed">
              <p data-gsap="heading">
                Cada mensagem de agenda respondida sozinha é tempo que você não gasta no celular no
                meio do atendimento — à noite, no domingo, no intervalo.
              </p>
              <p data-gsap="heading">
                A partir de R$&nbsp;59/mês: menos que um dia de agenda perdida por demora na
                resposta.
              </p>
              <p data-gsap="heading">
                Você liga e desliga a IA, define horários e o estilo da conversa. O negócio continua
                com a sua cara.
              </p>
            </div>
          </div>

          <div
            data-gsap="item"
            className="rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-sm p-8 md:p-10"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-4">
              Conta rápida
            </p>
            <p className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              R$ 59
              <span className="text-xl text-slate-400 font-bold">/mês</span>
            </p>
            <p className="mt-4 text-slate-300 font-medium leading-relaxed">
              Plano Basic. Se o Wagoo recuperar{" "}
              <span className="text-[#9ae07f] font-bold">um único horário</span> que você perderia
              por demora na resposta, o mês já se paga.
            </p>
            <dl className="mt-8 space-y-4 border-t border-white/10 pt-6">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-sm text-slate-400 font-semibold">Atendimento na agenda</dt>
                <dd className="text-lg font-black text-[#64b34d]">24/7</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
