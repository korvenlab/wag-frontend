import { Check, MessageCircle, TrendingUp, Users, Wallet } from "lucide-react";

const MOCK_PROS = ["AM", "RC", "LS"] as const;
const MOCK_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00"] as const;

const REVENUE_BARS = [38, 62, 47, 78, 55, 88, 70] as const;

const TEAM_COMMISSIONS = [
  { initials: "AM", name: "Ana M.", amount: "R$ 2.340" },
  { initials: "RC", name: "Rafa C.", amount: "R$ 1.890" },
  { initials: "LS", name: "Luísa S.", amount: "R$ 2.010" },
] as const;

/** Ecossistema completo — bento com mocks numéricos (inspirado em BarberAgend). */
export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      data-gsap-section
      className="relative py-28 md:py-36 bg-[var(--wagoo-paper)] overflow-hidden"
    >
      <div className="absolute top-0 left-1/4 w-[560px] h-[560px] bg-[#64b34d]/10 blur-[140px] rounded-full -z-10" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3] -z-10"
        style={{
          backgroundImage: "radial-gradient(rgba(15,23,42,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_minmax(0,340px)] gap-8 lg:gap-12 mb-14 md:mb-16 items-end">
          <div className="max-w-2xl">
            <p
              data-gsap="heading"
              className="text-[11px] font-black uppercase tracking-[0.22em] text-[#64b34d] mb-4"
            >
              Funcionalidades
            </p>
            <h2
              data-gsap="heading"
              className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[0.95] tracking-tight"
            >
              Não é só agenda.
              <span className="block text-[#64b34d]">É o ecossistema inteiro.</span>
            </h2>
          </div>
          <p
            data-gsap="heading"
            className="text-lg text-slate-500 font-medium leading-relaxed lg:pb-1"
          >
            Agenda, equipe, clientes, sinal e comissões. Tudo o que sua empresa precisa para
            funcionar — num sistema só, do link público ao fechamento do mês.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          {/* Agenda — wide */}
          <article
            data-gsap="item"
            className="md:col-span-2 rounded-[28px] border border-slate-200 bg-white p-6 md:p-8 grid lg:grid-cols-2 gap-8 items-center shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4d8f3b] mb-3">
                Agenda
              </p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                Sua agenda em tempo real, profissional por profissional
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-5">
                Veja o dia inteiro numa tela, com cada membro da equipe na sua coluna. Bloqueie um
                horário com um clique e receba aviso a cada nova marcação — pelo WhatsApp ou pelo
                link da Agenda Web.
              </p>
              <ul className="flex flex-wrap gap-2">
                {["Múltiplos profissionais", "Bloqueio rápido", "Google Calendar", "Aviso no celular"].map(
                  (chip) => (
                    <li
                      key={chip}
                      className="rounded-full border border-slate-200 bg-[var(--wagoo-paper)] px-3 py-1.5 text-xs font-bold text-slate-600"
                    >
                      {chip}
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div
              className="rounded-2xl border border-slate-200 bg-[var(--wagoo-paper)] p-4 md:p-5"
              aria-hidden
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Agenda · Qua, 12
                </p>
                <div className="flex gap-1.5">
                  {MOCK_PROS.map((initials) => (
                    <span
                      key={initials}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#64b34d]/15 text-[10px] font-black text-[#4d8f3b] border border-[#64b34d]/25"
                    >
                      {initials}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-[11px] font-bold">
                <div className="grid grid-cols-[44px_repeat(3,1fr)] gap-2">
                  <div />
                  {MOCK_PROS.map((p) => (
                    <div key={`head-${p}`} className="text-center text-slate-400 pb-1">
                      {p}
                    </div>
                  ))}
                </div>
                {MOCK_SLOTS.map((time, rowIdx) => (
                  <div key={time} className="grid grid-cols-[44px_repeat(3,1fr)] gap-2">
                    <div className="text-slate-400 py-2 pr-1 text-right">{time}</div>
                    {MOCK_PROS.map((p, colIdx) => {
                      const booked = rowIdx === 0 && colIdx === 0;
                      const blocked = rowIdx === 2 && colIdx === 2;
                      return (
                        <div
                          key={`${time}-${p}`}
                          className={
                            "rounded-xl min-h-[36px] flex items-center justify-center border " +
                            (booked
                              ? "bg-[#64b34d]/20 border-[#64b34d]/35 text-[#4d8f3b]"
                              : blocked
                                ? "bg-slate-100 border-slate-200 text-slate-400"
                                : "bg-white border-slate-200 border-dashed text-slate-300")
                          }
                        >
                          {booked ? (
                            <Check size={13} strokeWidth={3} />
                          ) : blocked ? (
                            <span className="text-[9px] uppercase tracking-wide">Bloq.</span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Sinal / WhatsApp */}
          <article
            data-gsap="item"
            className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-7 flex flex-col shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4d8f3b] mb-3">
              WhatsApp + sinal
            </p>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
              Horário garantido, menos faltas
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed text-[15px] mb-5 flex-1">
              Cliente agenda pelo chat ou link, paga sinal quando você quiser e recebe confirmação
              automática — sem ficar respondendo mensagem o dia todo.
            </p>

            <div
              className="rounded-2xl border border-slate-200 bg-[var(--wagoo-paper)] p-4 space-y-3"
              aria-hidden
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Consulta · 45 min</span>
                <span className="rounded-full bg-[#64b34d]/15 px-2.5 py-0.5 text-[10px] font-black uppercase text-[#4d8f3b]">
                  Sinal pago
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">R$ 50,00</p>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <MessageCircle size={14} className="text-[#64b34d]" />
                Lembrete enviado · Ter 14:00
              </div>
              <div className="rounded-xl bg-white border border-slate-200 px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Faltas no mês</span>
                <span className="text-sm font-black text-[#64b34d]">−38%</span>
              </div>
            </div>
          </article>

          {/* Analytics / caixa */}
          <article
            data-gsap="item"
            className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-7 flex flex-col shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
          >
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4d8f3b] mb-3">
              Caixa & analytics
            </p>
            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-3">
              Saiba exatamente quanto entrou no mês
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed text-[15px] mb-5 flex-1">
              Receita por período, ticket médio e faturamento por profissional — tudo num painel
              claro, sem planilha bagunçada.
            </p>

            <div
              className="rounded-2xl border border-slate-200 bg-[var(--wagoo-paper)] p-4"
              aria-hidden
            >
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Este mês
                </span>
                <span className="text-2xl font-extrabold text-slate-900">R$ 18.420</span>
              </div>
              <div className="flex items-end justify-between gap-1.5 h-24 mb-4">
                {REVENUE_BARS.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-[#64b34d]/30 to-[#64b34d]"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-white border border-slate-200 py-2 px-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Ticket médio</p>
                  <p className="text-sm font-black text-slate-800">R$ 87</p>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 py-2 px-2">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Atendimentos</p>
                  <p className="text-sm font-black text-slate-800">212</p>
                </div>
              </div>
            </div>
          </article>

          {/* Comissões — wide */}
          <article
            data-gsap="item"
            className="md:col-span-2 rounded-[28px] border border-slate-200 bg-white p-6 md:p-8 grid lg:grid-cols-2 gap-8 items-center shadow-[0_20px_50px_rgba(15,23,42,0.06)]"
          >
            <div
              className="rounded-2xl border border-slate-200 bg-[var(--wagoo-paper)] p-5 order-2 lg:order-1"
              aria-hidden
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Comissões · agosto
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4d8f3b]">
                  <TrendingUp size={14} />
                  +12%
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mb-5">R$ 6.240</p>
              <ul className="space-y-3">
                {TEAM_COMMISSIONS.map(({ initials, name, amount }) => (
                  <li
                    key={initials}
                    className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 px-3 py-2.5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#64b34d]/15 text-[10px] font-black text-[#4d8f3b]">
                      {initials}
                    </span>
                    <span className="flex-1 text-sm font-bold text-slate-700">{name}</span>
                    <span className="text-sm font-black text-slate-900">{amount}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#4d8f3b] mb-3">
                Comissões automáticas
              </p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                Cada profissional vê o dele — você vê o todo
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-5">
                O Wagoo soma atendimentos pagos no app e valores da sua planilha. Você acompanha o
                caixa no Analytics; cada membro da equipe recebe o link dele com ganhos e horários.
              </p>
              <ul className="flex flex-wrap gap-2">
                {["Fechamento mensal", "Link por profissional", "Exportação", "Caixa da loja"].map(
                  (chip) => (
                    <li
                      key={chip}
                      className="rounded-full border border-slate-200 bg-[var(--wagoo-paper)] px-3 py-1.5 text-xs font-bold text-slate-600"
                    >
                      {chip}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </article>
        </div>

        {/* Faixa de números */}
        <div
          data-gsap="fade"
          className="mt-10 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {[
            { icon: Users, label: "Profissionais na equipe", value: "Até 12" },
            { icon: Wallet, label: "Receita rastreada", value: "100%" },
            { icon: MessageCircle, label: "Agendamento via WhatsApp", value: "24/7" },
            { icon: TrendingUp, label: "Menos faltas com sinal", value: "−38%" },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 md:px-5 md:py-5 text-center"
            >
              <Icon size={18} className="mx-auto mb-2 text-[#64b34d]" strokeWidth={2.25} />
              <p className="text-xl md:text-2xl font-extrabold text-slate-900">{value}</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1 leading-snug">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
