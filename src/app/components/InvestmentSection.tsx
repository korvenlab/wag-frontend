import { useRef } from "react";
import { CalendarClock, Check, Link2, MessageCircle, Smartphone } from "lucide-react";

const CLIENT_FEATURES = [
  {
    icon: Link2,
    label: "Link público 24h",
    detail: "Marca pelo celular, sem baixar app nem criar conta.",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp integrado",
    detail: "Confirmação e lembrete automáticos no número da loja.",
  },
  {
    icon: CalendarClock,
    label: "Horário em tempo real",
    detail: "Escolhe serviço, profissional e vaga livre na hora.",
  },
  {
    icon: Smartphone,
    label: "Sinal opcional",
    detail: "Paga antecipado quando você quiser — horário garantido.",
  },
] as const;

const BOOKING_STEPS = [
  { step: "1", label: "Abre o link da loja", detail: "Página com a sua marca" },
  { step: "2", label: "Escolhe serviço e horário", detail: "Ter · 14:00 · Ana" },
  { step: "3", label: "Recebe confirmação", detail: "WhatsApp automático" },
] as const;

/** Valor + experiência do cliente — sem mock de agenda. */
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
        <div className="max-w-3xl mb-12 md:mb-14">
          <p
            data-gsap="heading"
            className="text-[11px] font-black uppercase tracking-[0.22em] text-[#9ae07f] mb-4"
          >
            Agendamento
          </p>
          <h2
            data-gsap="heading"
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-balance"
          >
            Tudo que seu cliente precisa{" "}
            <span className="text-[#64b34d]">para agendar</span>
          </h2>
          <p
            data-gsap="heading"
            className="text-base md:text-lg text-slate-300 font-medium leading-relaxed mt-5"
          >
            Link público, WhatsApp e confirmação automática — o cliente marca sozinho, a qualquer
            hora, sem fila de mensagem e sem instalar app.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_minmax(0,360px)] gap-10 lg:gap-12 items-start">
          <ul className="grid sm:grid-cols-2 gap-3" data-gsap="item">
            {CLIENT_FEATURES.map(({ icon: Icon, label, detail }) => (
              <li
                key={label}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4"
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#64b34d]/20 text-[#9ae07f]">
                  <Icon size={16} strokeWidth={2.25} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-white">{label}</span>
                  <span className="block text-sm text-slate-400 font-medium mt-0.5">{detail}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-5">
            <div
              data-gsap="item"
              className="rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-sm p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
              aria-hidden
            >
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 mb-5">
                Fluxo do cliente
              </p>
              <ol className="space-y-4">
                {BOOKING_STEPS.map(({ step, label, detail }, idx) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#64b34d]/20 text-xs font-black text-[#9ae07f] border border-[#64b34d]/30">
                      {step}
                    </span>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-bold text-white">{label}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{detail}</p>
                    </div>
                    {idx === BOOKING_STEPS.length - 1 ? (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#64b34d]/25 text-[#9ae07f]">
                        <Check size={16} strokeWidth={3} />
                      </span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>

            <div
              data-gsap="item"
              className="rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-sm p-8"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-4">
                Conta rápida
              </p>
              <p className="text-5xl font-extrabold text-white tracking-tight">
                R$ 59
                <span className="text-xl text-slate-400 font-bold">/mês</span>
              </p>
              <p className="mt-4 text-slate-300 font-medium leading-relaxed text-[15px]">
                Plano Basic. Se o Wagoo recuperar{" "}
                <span className="text-[#9ae07f] font-bold">um único horário</span> que você perderia
                por demora na resposta, o mês já se paga.
              </p>
              <dl className="mt-6 space-y-3 border-t border-white/10 pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-sm text-slate-400 font-semibold">Agendamento online</dt>
                  <dd className="text-lg font-black text-[#64b34d]">24/7</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-sm text-slate-400 font-semibold">Confirmação automática</dt>
                  <dd className="text-lg font-black text-[#64b34d]">Sim</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
