const POINTS = [
  {
    title: "WhatsApp no fluxo do cliente",
    description:
      "Seu cliente já fala por ali. O Wagoo responde no mesmo canal — sem app novo pra ele baixar.",
  },
  {
    title: "Google Calendar de verdade",
    description:
      "OAuth seguro. Só o necessário pra ler disponibilidade e criar eventos na sua agenda.",
  },
  {
    title: "Dados sob controle",
    description:
      "Conexão criptografada (TLS). Sem revenda de dados de clientes. Você decide o que a IA fala.",
  },
] as const;

export function TrustSafety() {
  return (
    <section
      id="seguranca"
      data-gsap-section
      className="relative py-24 md:py-28 bg-[var(--wagoo-paper)] overflow-hidden"
    >
      <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-[#64b34d]/10 blur-[120px] rounded-full -z-10" />

      <div className="relative z-10 max-w-3xl mx-auto px-6">
        <div className="mb-12 md:mb-14 space-y-5">
          <h2
            data-gsap="heading"
            className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[0.95]"
          >
            Ferramentas que o mercado{" "}
            <span className="text-[#64b34d]">já usa</span>
          </h2>
          <p data-gsap="heading" className="text-lg text-slate-500 font-medium leading-relaxed">
            WhatsApp, Google e criptografia — base sólida pra operar sem surpresa.
          </p>
        </div>

        <ul className="space-y-0 divide-y divide-slate-200/90 border-y border-slate-200/90">
          {POINTS.map((point, index) => (
            <li
              key={point.title}
              data-gsap="item"
              className="py-7 md:py-8 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2"
            >
              <span className="text-sm font-black text-[#64b34d] tracking-tight pt-0.5">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {point.title}
                </h3>
                <p className="text-[15px] text-slate-500 font-medium leading-relaxed">
                  {point.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
