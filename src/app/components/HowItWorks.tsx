const STEPS = [
  {
    step: "01",
    title: "Cliente manda mensagem",
    description: "No WhatsApp, no tom dele. Pediu horário — o Wagoo entende e responde.",
  },
  {
    step: "02",
    title: "Consulta o Google Calendar",
    description: "Vê o que está livre na sua agenda real, nos horários que você definiu.",
  },
  {
    step: "03",
    title: "Confirma e sincroniza",
    description: "Marca o horário, avisa o cliente e aparece na sua agenda — pronto.",
  },
] as const;

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
          backgroundImage:
            "radial-gradient(rgba(15,23,42,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-16 md:mb-20">
          <h2
            data-gsap="heading"
            className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[0.95] tracking-tight"
          >
            Do WhatsApp ao Calendar
            <span className="block text-[#64b34d]">sem você no meio.</span>
          </h2>
          <p
            data-gsap="heading"
            className="text-lg text-slate-500 mt-6 font-medium leading-relaxed"
          >
            Três batidas. O cliente fala como sempre fala — o Wagoo cuida da agenda.
          </p>
        </div>

        {/* Timeline: vertical no mobile, horizontal no desktop */}
        <div className="relative">
          {/* Linha horizontal (desktop) */}
          <div
            className="hidden md:block absolute top-[18px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-[#64b34d]/40 to-transparent"
            aria-hidden
          />
          {/* Linha vertical (mobile) */}
          <div
            className="md:hidden absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-[#64b34d]/50 via-[#64b34d]/25 to-transparent"
            aria-hidden
          />

          <ol className="grid md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map((item) => (
              <li
                key={item.step}
                data-gsap="item"
                className="relative pl-12 md:pl-0"
              >
                <div className="absolute left-0 md:static md:mb-6 flex items-center gap-3">
                  <span className="flex h-[30px] w-[30px] md:h-9 md:w-9 items-center justify-center rounded-full bg-[#64b34d] text-white text-[11px] font-black tracking-tight shadow-[0_0_0_6px_var(--wagoo-paper)]">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-500 leading-relaxed font-medium text-[15px]">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Âncora visual única: fluxo WhatsApp → Calendar */}
        <div
          data-gsap="fade"
          className="mt-16 md:mt-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-0"
          aria-hidden
        >
          <div className="flex-1 max-w-xs mx-auto sm:mx-0 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4d8f3b] mb-1">
              WhatsApp
            </p>
            <p className="text-sm font-bold text-slate-800">
              &quot;Pode ser amanhã às 14h?&quot;
            </p>
          </div>
          <div className="hidden sm:flex items-center px-3 text-[#64b34d] font-black text-lg" aria-hidden>
            →
          </div>
          <div className="sm:hidden text-center text-[#64b34d] font-black text-sm py-1" aria-hidden>
            ↓
          </div>
          <div className="flex-1 max-w-xs mx-auto sm:mx-0 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4285F4] mb-1">
              Google Calendar
            </p>
            <p className="text-sm font-bold text-slate-800">Maria Silva · Terça 14:00</p>
          </div>
        </div>
      </div>
    </section>
  );
}
