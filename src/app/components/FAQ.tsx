import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "Como funciona a integração com o Google Calendar?",
      answer:
        "Após conectar sua conta Google, o Wagoo consulta a disponibilidade em tempo real e cria os agendamentos na sua agenda. Tudo sincroniza na hora.",
    },
    {
      question: "Preciso ter conhecimentos técnicos para configurar?",
      answer:
        "Não. O setup é guiado: conecta o WhatsApp, autoriza o Google Calendar e escolhe o nicho. O resto o Wagoo resolve.",
    },
    {
      question: "O que acontece se eu cancelar?",
      answer:
        "Pode cancelar quando quiser, sem multa nem fidelidade. Você paga só pelo mês usado.",
    },
    {
      question: "Qual plano preciso contratar?",
      answer:
        "Basic (R$ 59/mês, 1 usuário), Pro (R$ 149/mês, até 3) e Pro+ (R$ 259/mês, até 5). Todos incluem WhatsApp, Google Agenda, IA e estilo de conversa. Lembretes, export CSV e equipe são exclusivos do Pro e Pro+.",
    },
    {
      question: "O Wagoo é exclusivo para a minha agenda?",
      answer:
        "No Basic, a agenda principal do negócio. No Pro e Pro+, cada profissional pode ter agenda própria vinculada.",
    },
    {
      question: "Meus dados e os dos meus clientes estão seguros?",
      answer:
        "Usamos OAuth2, criptografia em trânsito (TLS) e práticas alinhadas à LGPD. Não revendemos dados dos seus clientes.",
    },
    {
      question: "Posso usar com WhatsApp pessoal ou precisa ser Business?",
      answer:
        "Funciona com as duas. Business ajuda no dia a dia profissional, mas a automação de agenda roda em qualquer conta conectada.",
    },
  ];

  return (
    <section id="faq" data-gsap-section className="relative py-28 md:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 space-y-5">
          <h2
            data-gsap="heading"
            className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight"
          >
            Tire suas <span className="text-[#64b34d]">dúvidas</span>
          </h2>
          <p data-gsap="heading" className="text-xl text-slate-500 font-medium">
            O essencial pra decidir com segurança
          </p>
        </div>

        <div data-gsap="item">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`item-${index}`}
                className="bg-white border border-slate-200 rounded-2xl px-6 shadow-wg-subtle hover:border-slate-300 hover:shadow-wg-faq-hover transition-[box-shadow,border-color] overflow-hidden data-[state=open]:border-slate-300 data-[state=open]:bg-[#64b34d]/5 data-[state=open]:shadow-wg-card"
              >
                <AccordionTrigger className="text-left text-slate-900 hover:no-underline py-6 [&[data-state=open]]:text-[#64b34d]">
                  <span className="text-lg font-bold pr-4 leading-tight">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 font-medium leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div data-gsap="fade" className="text-center mt-16">
          <p className="text-slate-500 mb-6 font-medium">Ainda com dúvida? Fala com a gente.</p>
          <a
            href="https://wa.me/5582999450453"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold shadow-wg-cta hover:bg-[#64b34d] transition-[box-shadow,background-color] border border-slate-700"
          >
            Falar com o Suporte
          </a>
        </div>
      </div>
    </section>
  );
}
