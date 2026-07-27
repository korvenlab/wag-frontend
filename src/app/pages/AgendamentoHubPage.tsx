import { ContentSeoPage } from "../components/ContentSeoPage";
import { getSeoPageByPath } from "../lib/seoPages";

const meta = getSeoPageByPath("/agendamento")!;

export function AgendamentoHubPage() {
  return (
    <ContentSeoPage
      meta={meta}
      h1="Agendamento automático que roda enquanto você atende"
      lead="Pedido de horário no WhatsApp, confirmação na hora e evento no Google Calendar. O Wagoo cuida do agendamento para você não perder cliente por demora na resposta."
      sections={[
        {
          heading: "O que é agendamento automático",
          body: [
            "É tirar o “tem horário?” do seu colo. O cliente pede, o sistema consulta disponibilidade real e confirma — sem planilha e sem você digitar o compromisso à mão.",
            "No Wagoo, o canal principal é o WhatsApp: onde seu cliente já fala. A agenda de verdade continua no Google Calendar.",
          ],
        },
        {
          heading: "Por onde começar",
          body: [
            "Se o gargalo é o zap, comece pelo guia de agendamento no WhatsApp. Se o problema é furos entre chat e calendário, veja a integração WhatsApp + Google Calendar.",
            "Sem trial: a partir de R$ 59/mês. O retorno começa no primeiro horário que você não perde por demora.",
          ],
        },
      ]}
      relatedLinks={[
        { to: "/agendamento/whatsapp", label: "Agendamento no WhatsApp" },
        { to: "/agenda-whatsapp-google-calendar", label: "WhatsApp + Google Calendar" },
        { to: "/wagoo-vs-planilha", label: "Wagoo vs planilha" },
      ]}
      faqs={[
        {
          q: "Preciso mudar a forma como o cliente marca horário?",
          a: "Não. Ele continua no WhatsApp. O Wagoo responde no mesmo canal e sincroniza com o Google Calendar.",
        },
        {
          q: "Funciona 24 horas?",
          a: "Sim. Pedidos de agenda fora do horário comercial também entram no fluxo — você define as janelas disponíveis.",
        },
        {
          q: "Quanto custa?",
          a: "Basic a partir de R$ 59/mês, Pro R$ 149 e Pro+ R$ 259 — conforme usuários e recursos como lembretes e equipe.",
        },
      ]}
    />
  );
}
