import { ContentSeoPage } from "../components/ContentSeoPage";
import { CONTENT_SEO_PAGES } from "../lib/seoPages";

const meta = CONTENT_SEO_PAGES[2];

export function WagooVsPlanilhaPage() {
  return (
    <ContentSeoPage
      meta={meta}
      h1="Wagoo vs planilha: quem responde o cliente quando você está ocupado?"
      lead="Planilha organiza depois. WhatsApp acontece agora. Comparar os dois mostra por que agenda manual vaza horário — e onde o Wagoo se paga."
      sections={[
        {
          heading: "O que a planilha faz bem",
          body: [
            "Listar nomes, horários e status depois que alguém já confirmou. É barata e familiar.",
            "O problema começa antes da linha ser preenchida: o cliente está no WhatsApp pedindo horário, e a planilha não responde.",
          ],
        },
        {
          heading: "Onde a planilha perde para o Wagoo",
          body: [
            "Planilha não consulta Google Calendar sozinha, não confirma às 22h e não evita double booking sem disciplina humana.",
            "Cada atraso na resposta é um horário que pode ir para o concorrente. O Wagoo ataca essa dor: conversa no WhatsApp vira evento na agenda.",
          ],
        },
        {
          heading: "Conta rápida de investimento",
          body: [
            "Basic a partir de R$ 59/mês. Se o sistema recuperar um único horário que a demora na planilha/chat faria você perder, o mês já se justifica.",
            "Não é “mais uma ferramenta”: é tirar da sua mão o trabalho repetitivo de remarcar e confirmar, mantendo o calendário como fonte da verdade.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Preciso abandonar a planilha no mesmo dia?",
          a: "Não. Muita gente usa o Wagoo na operação diária e mantém exportações (Pro/Pro+) para contabilidade ou relatório.",
        },
        {
          q: "Planilha + WhatsApp manual não basta?",
          a: "Basta até o volume crescer. Aí o custo escondido é o seu tempo — e os horários que esfriam sem resposta.",
        },
        {
          q: "Tem fidelidade?",
          a: "Não. Cancele quando quiser. Pagamento via Stripe.",
        },
      ]}
    />
  );
}
