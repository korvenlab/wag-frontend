import { ContentSeoPage } from "../components/ContentSeoPage";
import { getSeoPageByPath } from "../lib/seoPages";

const meta = getSeoPageByPath("/agenda-whatsapp-google-calendar")!;

export function AgendaWhatsappGoogleCalendarPage() {
  return (
    <ContentSeoPage
      meta={meta}
      h1="WhatsApp + Google Calendar: agenda em tempo real, sem copiar horário"
      lead="Disponibilidade de verdade, confirmação no chat e evento criado na hora. É isso que a integração Wagoo entrega entre WhatsApp e Google Calendar."
      sections={[
        {
          heading: "Por que juntar os dois",
          body: [
            "O cliente fala no WhatsApp. Você trabalha no Google Calendar. Quando esses mundos não conversam, nascem furos, double booking e follow-up infinito.",
            "Uma agenda WhatsApp + Google Calendar bem feita consulta o que está livre, responde o cliente e cria o compromisso na mesma operação.",
          ],
        },
        {
          heading: "Como a sincronização funciona no Wagoo",
          body: [
            "Você autoriza o Google via OAuth. O Wagoo lê disponibilidade e cria eventos só para agendamento — sem reinventar sua agenda.",
            "No WhatsApp, o fluxo continua natural: pedido de horário, confirmação e registro. Pro e Pro+ somam lembretes antes do compromisso.",
          ],
        },
        {
          heading: "Resultado no negócio",
          body: [
            "Menos tempo no celular no meio do atendimento. Menos “me confirma de novo?”. Mais horários que realmente entram na agenda.",
            "Se você busca integração WhatsApp Google Calendar sem planilha no meio, o caminho é automatizar a ponte — não contratar alguém só para digitar horário.",
          ],
        },
      ]}
      relatedLinks={[
        { to: "/agendamento", label: "Hub de agendamento" },
        { to: "/agendamento/whatsapp", label: "Agendamento no WhatsApp" },
      ]}
      faqs={[
        {
          q: "O Wagoo altera minha agenda inteira?",
          a: "Ele consulta disponibilidade e cria eventos de agendamento. Você mantém o controle dos horários e pode desligar a IA quando quiser.",
        },
        {
          q: "Funciona com mais de um profissional?",
          a: "No Pro e Pro+ dá para operar com equipe e agendas vinculadas, conforme o plano.",
        },
        {
          q: "E a privacidade dos dados?",
          a: "Conexão criptografada (TLS), OAuth2 no Google e práticas alinhadas à LGPD. Não revendemos dados dos seus clientes.",
        },
      ]}
    />
  );
}
