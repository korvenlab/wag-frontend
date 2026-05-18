import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

export function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const faqs = [
    {
      question: "Como funciona a integração com o Google Calendar?",
      answer:
        "A integração é automática e segura. Após conectar sua conta do Google, o Wagoo acessa seu calendário em tempo real para verificar sua disponibilidade e criar agendamentos. Tudo sincroniza instantaneamente.",
    },
    {
      question: "Preciso ter conhecimentos técnicos para configurar?",
      answer:
        "Não! O setup leva apenas 2 minutos e é totalmente guiado. Você conecta seu WhatsApp e autoriza o Google Calendar. Nosso assistente inteligente cuida de todo o resto para você.",
    },
    {
      question: "O que acontece se eu cancelar?",
      answer:
        "Você pode cancelar a qualquer momento sem burocracia. Não há multas ou contratos de fidelidade. Você paga apenas pelo mês que utilizar.",
    },
    {
      question: "Qual plano preciso contratar?",
      answer:
        "Na landing você vê apenas o Plano Pro (R$ 60/mês): WhatsApp conectado, Google Agenda sincronizado e IA confirmando horários na sua agenda principal. É o plano base para começar a usar o Wagoo.",
    },
    {
      question: "O Wagoo é exclusivo para a minha agenda?",
      answer:
        "Com o Plano Pro, o Wagoo gerencia sua agenda principal no Google Calendar — ideal para autônomos e negócios com um profissional por assinatura.",
    },
    {
      question: "Meus dados e os dos meus clientes estão seguros?",
      answer:
        "Absolutamente! Usamos criptografia de ponta a ponta. Seus dados e os de seus clientes estão protegidos com segurança de nível bancário e seguimos todas as normas da LGPD.",
    },
    {
      question: "Posso usar com WhatsApp pessoal ou precisa ser Business?",
      answer:
        "O Wagoo funciona perfeitamente com ambas as versões. Recomendamos o Business para ter acesso a mais ferramentas profissionais, mas a automação de agenda funciona em qualquer conta.",
    },
  ];

  return (
    <section
      id="faq"
      ref={ref}
      className="relative py-32 bg-white"
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-2 rounded-full bg-green-50 border border-slate-200 mb-6"
          >
            <span className="text-sm text-[#64b34d] font-bold uppercase tracking-widest">
              Dúvidas Comuns
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-black mb-6 text-slate-900 tracking-tighter">
            Tire Suas <span className="text-[#64b34d]">Dúvidas</span>
          </h2>

          <p className="text-xl text-slate-500 font-medium">
            Tudo o que você precisa saber sobre o Wagoo
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * index }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-white border border-slate-200 rounded-2xl px-6 shadow-wg-subtle hover:border-slate-300 hover:shadow-wg-faq-hover transition-[box-shadow,border-color] overflow-hidden data-[state=open]:border-slate-300 data-[state=open]:bg-green-50/30 data-[state=open]:shadow-wg-card"
                >
                  <AccordionTrigger className="text-left text-slate-900 hover:no-underline py-6 [&[data-state=open]]:text-[#64b34d]">
                    <span className="text-lg font-bold pr-4 leading-tight">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 font-medium leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-slate-500 mb-6 font-medium">
            Ainda tem dúvidas? Nossa equipe está pronta para ajudar!
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold shadow-wg-cta hover:bg-[#64b34d] transition-[box-shadow,background-color] border border-slate-700"
          >
            Falar com o Suporte
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
