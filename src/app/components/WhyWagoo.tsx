import { MessageCircle, Wallet, Percent } from "lucide-react";

const PILLARS = [
  {
    icon: MessageCircle,
    title: "Cliente marca no WhatsApp",
    body: "Seu cliente já fala no WhatsApp. A IA responde, informa preço e marca o horário — sem mandar ele baixar app ou abrir outro site só pra isso.",
  },
  {
    icon: Wallet,
    title: "Horário firme com sinal",
    body: "O horário só fica garantido quando você quiser cobrar sinal. Menos falta, menos “esqueceu”, menos buraco na agenda.",
  },
  {
    icon: Percent,
    title: "Comissão fecha sozinha",
    body: "Cada profissional vê o que faturou no link dele; você fecha o caixa no Analytics. Sem planilha bagunçada no fim do mês.",
  },
] as const;

/** Posicionamento de marketing — mensagem clara vs “só agenda online”. */
export function WhyWagoo() {
  return (
    <section
      id="por-que-wagoo"
      data-gsap-section
      className="relative py-24 md:py-32 bg-white overflow-hidden"
    >
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[480px] h-[480px] bg-[#64b34d]/8 rounded-full blur-[120px] -z-10" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-12 md:mb-16 space-y-5">
          <p
            data-gsap="heading"
            className="text-[11px] font-black uppercase tracking-[0.22em] text-[#64b34d]"
          >
            Por que Wagoo
          </p>
          <h2
            data-gsap="heading"
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.05]"
          >
            Não é “mais uma agenda online”.
            <span className="block text-[#64b34d] mt-2">
              É WhatsApp que opera, sinal que protege e comissão que fecha.
            </span>
          </h2>
          <p
            data-gsap="heading"
            className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl"
          >
            O cliente marca no WhatsApp. O horário só fica firme com sinal. A comissão fecha
            sozinha. Você vende menos falta, menos ida-e-volta e caixa da equipe — não só um link
            de marcação.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {PILLARS.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              data-gsap="item"
              className="rounded-[28px] border border-slate-200 bg-[var(--wagoo-paper,#F8FAFC)] p-7 md:p-8 space-y-4"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#64b34d]/15 text-[#4d8f3b]">
                <Icon size={22} strokeWidth={2.25} />
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{body}</p>
            </article>
          ))}
        </div>

        <ul
          data-gsap="fade"
          className="mt-10 md:mt-12 grid sm:grid-cols-2 gap-3 text-sm font-semibold text-slate-600"
        >
          {[
            "IA no WhatsApp da loja — não só chatbot no site",
            "Link de Agenda Web incluso quando você precisa do bio",
            "Anti-falta com sinal e confirmação de presença",
            "Sem trocar o sistema do salão: WhatsApp + Calendar + caixa",
          ].map((line) => (
            <li
              key={line}
              className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3.5"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#64b34d]" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
