import { ContentSeoPage } from "../components/ContentSeoPage";
import { CONTENT_SEO_PAGES } from "../lib/seoPages";

const meta = CONTENT_SEO_PAGES[0];

export function AutomatizarAgendamentoWhatsappPage() {
  return (
    <ContentSeoPage
      meta={meta}
      h1="Como automatizar agendamentos no WhatsApp sem perder o fio da meada"
      lead="Se o seu cliente já marca horário pelo zap, o gargalo não é o canal — é você ter que responder cada mensagem. O Wagoo cuida disso e grava no Google Calendar."
      sections={[
        {
          heading: "A dor: agenda que vive no chat",
          body: [
            "Mensagem à noite, no domingo, no intervalo do atendimento. Você responde quando dá — e nesse tempo o cliente já pediu horário em outro lugar.",
            "Automação de agendamento no WhatsApp não é “bot genérico”: é confirmar disponibilidade real e registrar o horário onde você realmente trabalha — no Google Calendar.",
          ],
        },
        {
          heading: "O que o Wagoo faz na prática",
          body: [
            "O cliente escreve como sempre escreve. O Wagoo entende o pedido, consulta sua agenda, confirma o horário e sincroniza o evento.",
            "Você define janelas de atendimento e o tom da conversa. Liga e desliga quando quiser. Sem trial: a partir de R$ 59/mês, o retorno começa no primeiro horário que você não perde por demora.",
          ],
        },
        {
          heading: "Para quem faz sentido",
          body: [
            "Clínicas, salões, consultórios, profissionais autônomos e equipes pequenas que já usam WhatsApp como canal principal de reserva.",
            "Se a sua operação ainda depende de copiar horário do chat para a agenda, automatizar esse passo é o atalho mais barato para recuperar tempo.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Preciso de WhatsApp Business?",
          a: "Não é obrigatório. Business ajuda no dia a dia profissional, mas a automação de agenda roda com a conta que você conectar.",
        },
        {
          q: "O cliente precisa baixar outro app?",
          a: "Não. Ele continua no WhatsApp. O Wagoo responde no mesmo canal e sincroniza com o Google Calendar.",
        },
        {
          q: "Quanto custa?",
          a: "Basic a partir de R$ 59/mês, Pro R$ 149 e Pro+ R$ 259 — conforme usuários e recursos como lembretes e equipe.",
        },
      ]}
    />
  );
}
