import { Calendar, MessageCircle, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

const CARDS: {
  title: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    title: "WhatsApp no fluxo do cliente",
    description:
      "Seu cliente já fala por ali. O Wagoo responde no mesmo canal — sem app novo pra ele baixar.",
    icon: <MessageCircle className="w-7 h-7" strokeWidth={2.25} />,
  },
  {
    title: "Google Calendar de verdade",
    description:
      "OAuth seguro. Só o necessário pra ler disponibilidade e criar eventos na sua agenda.",
    icon: <Calendar className="w-7 h-7" strokeWidth={2.25} />,
  },
  {
    title: "Dados sob controle",
    description:
      "Conexão criptografada (TLS). Sem revenda de dados de clientes. Você decide o que a IA fala.",
    icon: <ShieldCheck className="w-7 h-7" strokeWidth={2.25} />,
  },
];

export function TrustSafety() {
  return (
    <section
      id="seguranca"
      data-gsap-section
      className="relative py-24 md:py-28 bg-[var(--wagoo-paper)] overflow-hidden"
    >
      <div className="absolute top-0 right-1/4 w-[480px] h-[480px] bg-[#64b34d]/10 blur-[120px] rounded-full -z-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-5">
          <div
            data-gsap="heading"
            className="inline-block px-4 py-2 rounded-full bg-white border border-slate-200 shadow-wg-subtle"
          >
            <span className="text-[11px] text-[#64b34d] font-bold uppercase tracking-[0.2em]">
              Confiança e segurança
            </span>
          </div>
          <h2
            data-gsap="heading"
            className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[0.95]"
          >
            Ferramentas que o mercado{" "}
            <span className="text-[#64b34d]">já confia</span>
          </h2>
          <p data-gsap="heading" className="text-lg text-slate-500 font-medium leading-relaxed">
            WhatsApp, Google e criptografia — base sólida pra operar sem surpresa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {CARDS.map((card) => (
            <article
              key={card.title}
              data-gsap="item"
              className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-wg-subtle hover:border-slate-300 hover:shadow-wg-card transition-[box-shadow,border-color]"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#64b34d]/10 text-[#64b34d] border border-[#64b34d]/15">
                {card.icon}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-3">
                {card.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
