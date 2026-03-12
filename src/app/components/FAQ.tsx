import { motion, useInView } from "motion/react";
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
        "A integração é automática e segura. Após conectar sua conta do Google, o WAG BOT acessa seu calendário em tempo real para verificar disponibilidade e criar agendamentos. Tudo sincroniza instantaneamente, e você mantém controle total sobre suas permissões.",
    },
    {
      question: "Preciso ter conhecimentos técnicos para configurar?",
      answer:
        "Não! O setup leva apenas 5 minutos e é totalmente guiado. Você conecta seu WhatsApp Business, autoriza o Google Calendar e pronto. Nosso assistente inteligente te guia em cada passo do processo.",
    },
    {
      question: "Posso personalizar as mensagens do bot?",
      answer:
        "Sim! Você pode personalizar todas as mensagens, desde a saudação inicial até a confirmação de agendamento. Configure o tom de voz da sua marca, adicione emojis e crie uma experiência única para seus clientes.",
    },
    {
      question: "O que acontece se eu cancelar?",
      answer:
        "Você pode cancelar a qualquer momento sem burocracia. Não há multas ou taxas de cancelamento. Seus dados ficam salvos por 30 dias caso decida voltar. E se cancelar nos primeiros 30 dias, devolvemos 100% do seu investimento.",
    },
    {
      question: "Funciona para múltiplos atendentes ou apenas para mim?",
      answer:
        "O WAG BOT suporta múltiplos atendentes! Você pode conectar vários calendários e o bot identifica automaticamente quem está disponível em cada horário. Perfeito para clínicas, escritórios e equipes.",
    },
    {
      question: "Como funciona o período de teste gratuito?",
      answer:
        "Você tem 7 dias de teste gratuito com acesso completo a todos os recursos. Não pedimos cartão de crédito no cadastro. Após o período de teste, você escolhe se quer continuar com o plano Pro.",
    },
    {
      question: "Meus dados e os dos meus clientes estão seguros?",
      answer:
        "Absolutamente! Usamos criptografia de ponta a ponta e seguimos as normas da LGPD. Seus dados e os de seus clientes estão protegidos com o mesmo nível de segurança usado por bancos. Nunca compartilhamos informações com terceiros.",
    },
    {
      question: "Posso usar com WhatsApp pessoal ou precisa ser Business?",
      answer:
        "Recomendamos o WhatsApp Business para aproveitar todos os recursos profissionais, mas o WAG BOT funciona com ambas as versões. Com o Business, você tem acesso a estatísticas adicionais e ferramentas de automação avançadas.",
    },
  ];

  return (
    <section
      id="faq"
      ref={ref}
      className="relative py-32 bg-gradient-to-b from-white to-gray-50"
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
            className="inline-block px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6"
          >
            <span className="text-sm text-[#007BFF] font-semibold">
              Perguntas Frequentes
            </span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">
            Tire Suas{" "}
            <span className="bg-gradient-to-r from-[#007BFF] to-[#6F42C1] bg-clip-text text-transparent">
              Dúvidas
            </span>
          </h2>

          <p className="text-xl text-gray-600">
            Tudo o que você precisa saber sobre o WAG BOT
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
                  className="bg-white border border-gray-200 rounded-2xl px-6 hover:border-gray-300 hover:shadow-lg transition-all overflow-hidden data-[state=open]:bg-gray-50"
                >
                  <AccordionTrigger className="text-left text-gray-900 hover:no-underline py-6 [&[data-state=open]]:text-transparent [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-[#007BFF] [&[data-state=open]]:to-[#6F42C1] [&[data-state=open]]:bg-clip-text">
                    <span className="text-lg font-semibold pr-4">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed pb-6">
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
          <p className="text-gray-600 mb-6">
            Ainda tem dúvidas? Nossa equipe está pronta para ajudar!
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full bg-white border border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 transition-all shadow-sm"
          >
            Falar com o Suporte
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}