import { useRef } from "react";
import { Clock3, TrendingUp, Wallet, ShieldCheck } from "lucide-react";

const POINTS = [
  {
    icon: Clock3,
    title: "Tempo que volta pra você",
    body: "Cada mensagem de agenda respondida sozinha é minutos que você não gasta no celular no meio do atendimento.",
  },
  {
    icon: Wallet,
    title: "Investimento previsível",
    body: "A partir de R$ 59/mês — menos que um dia de agenda perdida por falta de resposta rápida.",
  },
  {
    icon: TrendingUp,
    title: "Agenda que não dorme",
    body: "Cliente marca à noite, no domingo, no intervalo. O Wagoo responde e joga no Google Calendar.",
  },
  {
    icon: ShieldCheck,
    title: "Operação sob seu controle",
    body: "Você liga/desliga a IA, define horários e o estilo da conversa. O negócio continua com a sua cara.",
  },
] as const;

/** Seção de valor — mostra por que o plano é investimento, sem prova social inventada. */
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

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-end mb-16">
          <div className="space-y-6 max-w-xl">
            <p
              data-gsap="heading"
              className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#9ae07f]"
            >
              Por que vale a pena
            </p>
            <h2
              data-gsap="heading"
              className="font-[family-name:var(--font-display)] text-4xl md:text-6xl font-extrabold tracking-tight leading-[0.95]"
            >
              Menos tempo no WhatsApp.
              <span className="block text-[#64b34d]">Mais tempo no que paga a conta.</span>
            </h2>
            <p data-gsap="heading" className="text-lg text-slate-300 font-medium leading-relaxed">
              O Wagoo não é “mais um app”. É a secretária que nunca esquece a agenda — por uma
              fração do custo de perder horários ou contratar alguém só pra responder mensagem.
            </p>
          </div>

          <div
            data-gsap="item"
            className="rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-sm p-8 md:p-10"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-4">
              Conta rápida
            </p>
            <p className="font-[family-name:var(--font-display)] text-5xl md:text-6xl font-extrabold text-white tracking-tight">
              R$ 59
              <span className="text-xl text-slate-400 font-bold">/mês</span>
            </p>
            <p className="mt-4 text-slate-300 font-medium leading-relaxed">
              Plano Basic. Se o Wagoo recuperar{" "}
              <span className="text-[#9ae07f] font-bold">um único horário</span> que você
              perderia por demora na resposta, o mês já se paga.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
                <p className="text-2xl font-black text-[#64b34d]">24/7</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">Atendimento na agenda</p>
              </div>
              <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
                <p className="text-2xl font-black text-[#64b34d]">0</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">Dias de trial — já é produto</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              data-gsap="item"
              className="rounded-[24px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-6 min-h-[220px] flex flex-col"
            >
              <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#64b34d]/15 text-[#9ae07f] border border-[#64b34d]/25">
                <Icon className="w-5 h-5" strokeWidth={2.25} />
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed flex-1">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
