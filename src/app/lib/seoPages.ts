export type SeoPageMeta = {
  path: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
};

export const SITE_ORIGIN = "https://wagobot.com";

export const HOME_SEO: SeoPageMeta = {
  path: "/",
  title: "Wagoo — Agenda no WhatsApp que se paga sozinha",
  description:
    "Wagoo agenda clientes pelo WhatsApp no seu Google Calendar, 24 horas por dia. Automação simples para profissionais e negócios.",
  ogTitle: "Wagoo — Agenda no automático",
  ogDescription:
    "Transforme conversas de WhatsApp em horários confirmados no Google Calendar.",
};

export const CONTENT_SEO_PAGES: SeoPageMeta[] = [
  {
    path: "/automatizar-agendamento-whatsapp",
    title: "Como automatizar agendamentos no WhatsApp | Wagoo",
    description:
      "Pare de responder “tem horário?” na mão. Veja como automatizar agendamentos no WhatsApp e gravar tudo no Google Calendar com o Wagoo.",
    ogTitle: "Automatize agendamentos no WhatsApp",
    ogDescription:
      "Cliente pede horário no WhatsApp — o Wagoo confirma e joga no Google Calendar, 24h.",
  },
  {
    path: "/agenda-whatsapp-google-calendar",
    title: "Agenda WhatsApp + Google Calendar em tempo real | Wagoo",
    description:
      "Integre WhatsApp e Google Calendar: disponibilidade real, confirmação automática e menos furos na agenda do seu negócio.",
    ogTitle: "WhatsApp + Google Calendar no automático",
    ogDescription:
      "Sincronize conversas de agenda com o Google Calendar sem planilha e sem copiar horário à mão.",
  },
  {
    path: "/wagoo-vs-planilha",
    title: "Wagoo vs planilha manual de agenda | Wagoo",
    description:
      "Compare agenda no WhatsApp com planilha: tempo perdido, furos e follow-up. Por que o Wagoo se paga no primeiro horário recuperado.",
    ogTitle: "Wagoo vs planilha de agendamentos",
    ogDescription:
      "Planilha não responde o cliente à noite. Veja a diferença na operação do dia a dia.",
  },
];

export const ALL_PRERENDER_PATHS = ["/", ...CONTENT_SEO_PAGES.map((p) => p.path)];
