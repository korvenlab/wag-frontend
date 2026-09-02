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

const MOCK_PROS = ["JP", "RC", "MS"] as const;
const MOCK_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00"] as const;

/** Valor + experiência do cliente — inspirado em feature blocks de agenda (BarberAgend). */
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
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8 max-w-xl">
            <div className="space-y-4">
              <p
                data-gsap="heading"
                className="text-[11px] font-black uppercase tracking-[0.22em] text-[#9ae07f]"
              >
                Agendamento
              </p>
              <h2
                data-gsap="heading"
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.02]"
              >
                Tudo que seu cliente precisa{" "}
                <span className="text-[#64b34d]">para agendar</span>
              </h2>
              <p
                data-gsap="heading"
                className="text-base md:text-lg text-slate-300 font-medium leading-relaxed"
              >
                Veja o dia inteiro numa tela, com cada profissional na sua coluna. O cliente escolhe
                o horário pelo link ou WhatsApp — você recebe aviso a cada nova marcação, sem ficar
                respondendo mensagem o dia todo.
              </p>
            </div>

            <ul className="space-y-3" data-gsap="item">
              {CLIENT_FEATURES.map(({ icon: Icon, label, detail }) => (
                <li
                  key={label}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5"
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
          </div>

          <div className="space-y-6">
            <div
              data-gsap="item"
              className="rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-sm p-5 md:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
              aria-hidden
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Agenda · Ter, 12
                </p>
                <div className="flex gap-1.5">
                  {MOCK_PROS.map((initials) => (
                    <span
                      key={initials}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#64b34d]/25 text-[10px] font-black text-[#9ae07f] border border-[#64b34d]/30"
                    >
                      {initials}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 text-[11px] font-bold">
                <div className="grid grid-cols-[52px_repeat(3,1fr)] gap-2">
                  <div />
                  {MOCK_PROS.map((p) => (
                    <div key={`head-${p}`} className="text-center text-slate-500 pb-1">
                      {p}
                    </div>
                  ))}
                </div>
                {MOCK_SLOTS.map((time, rowIdx) => (
                  <div key={time} className="grid grid-cols-[52px_repeat(3,1fr)] gap-2">
                    <div className="text-slate-500 py-2 pr-1 text-right">{time}</div>
                    {MOCK_PROS.map((p, colIdx) => {
                      const booked = rowIdx === 0 && colIdx === 0;
                      const blocked = rowIdx === 2 && colIdx === 2;
                      return (
                        <div
                          key={`${time}-${p}`}
                          className={
                            "rounded-xl min-h-[40px] flex items-center justify-center border " +
                            (booked
                              ? "bg-[#64b34d]/25 border-[#64b34d]/40 text-[#9ae07f]"
                              : blocked
                                ? "bg-white/5 border-white/10 text-slate-500"
                                : "bg-white/[0.03] border-white/10 border-dashed text-slate-600")
                          }
                        >
                          {booked ? (
                            <Check size={14} strokeWidth={3} />
                          ) : blocked ? (
                            <span className="text-[9px] uppercase tracking-wide">Bloq.</span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wide">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#64b34d]/20 text-[#9ae07f] px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#64b34d]" />
                  Ocupado
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 text-slate-400 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                  Bloqueado
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 text-slate-500 px-2.5 py-1 border border-dashed border-white/15">
                  Livre
                </span>
              </div>
            </div>

            <div
              data-gsap="item"
              className="rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-sm p-8 md:p-9"
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
      </div>
    </section>
  );
}
