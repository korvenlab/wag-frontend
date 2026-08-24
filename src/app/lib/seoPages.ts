export type SeoBreadcrumb = {
  name: string;
  path: string;
};

export type SeoPageMeta = {
  path: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Trilha para BreadcrumbList + UI (sem o item Início, que é sempre adicionado). */
  breadcrumbs?: SeoBreadcrumb[];
};

export const SITE_ORIGIN = "https://wagoobot.com";

export const HOME_SEO: SeoPageMeta = {
  path: "/",
  title: "Wagoo — Agenda, sinal e comissão no automático",
  description:
    "Marque horário pelo WhatsApp ou link, cobre sinal antecipado e feche a comissão da equipe no mês — sem planilha.",
  ogTitle: "Wagoo — Agenda, sinal e comissão no automático",
  ogDescription:
    "Horário marcado, pagamento no app e comissão de cada profissional — tudo no Wagoo.",
};

export const CONTENT_SEO_PAGES: SeoPageMeta[] = [
  {
    path: "/agendamento",
    title: "Agendamento automático | Wagoo",
    description:
      "Agendamento automático no WhatsApp e no Google Calendar. Menos furos, menos tempo no celular — o Wagoo confirma horário por você.",
    ogTitle: "Agendamento automático com o Wagoo",
    ogDescription:
      "Do pedido no chat ao horário na agenda — sem planilha e sem responder tudo à mão.",
    breadcrumbs: [{ name: "Agendamento", path: "/agendamento" }],
  },
  {
    path: "/agendamento/whatsapp",
    title: "Agendamento no WhatsApp | Wagoo",
    description:
      "Agendamentos no WhatsApp no automático: o cliente pede horário, o Wagoo confirma e grava no Google Calendar, 24 horas por dia.",
    ogTitle: "Agendamento no WhatsApp",
    ogDescription:
      "Automatize agendamentos no WhatsApp e sincronize com o Google Calendar — sem copiar horário à mão.",
    breadcrumbs: [
      { name: "Agendamento", path: "/agendamento" },
      { name: "WhatsApp", path: "/agendamento/whatsapp" },
    ],
  },
  {
    path: "/agenda-whatsapp-google-calendar",
    title: "Agenda WhatsApp + Google Calendar em tempo real | Wagoo",
    description:
      "Integre WhatsApp e Google Calendar: disponibilidade real, confirmação automática e menos furos na agenda do seu negócio.",
    ogTitle: "WhatsApp + Google Calendar no automático",
    ogDescription:
      "Sincronize conversas de agenda com o Google Calendar sem planilha e sem copiar horário à mão.",
    breadcrumbs: [
      { name: "Agendamento", path: "/agendamento" },
      { name: "WhatsApp + Calendar", path: "/agenda-whatsapp-google-calendar" },
    ],
  },
  {
    path: "/wagoo-vs-planilha",
    title: "Wagoo vs planilha manual de agenda | Wagoo",
    description:
      "Compare agenda no WhatsApp com planilha: tempo perdido, furos e follow-up. Por que o Wagoo se paga no primeiro horário recuperado.",
    ogTitle: "Wagoo vs planilha de agendamentos",
    ogDescription:
      "Planilha não responde o cliente à noite. Veja a diferença na operação do dia a dia.",
    breadcrumbs: [{ name: "Wagoo vs planilha", path: "/wagoo-vs-planilha" }],
  },
  {
    path: "/precos",
    title: "Preços e planos Wagoo | Agenda Web, Basic, Pro e Pro+",
    description:
      "Compare Agenda Web, Basic, Pro e Pro+: preços, usuários e tudo o que cada plano inclui — WhatsApp com IA, Analytics, equipe e Clube.",
    ogTitle: "Preços Wagoo",
    ogDescription:
      "Agenda Web, Basic, Pro e Pro+: escolha o plano certo para o seu negócio.",
    breadcrumbs: [{ name: "Preços", path: "/precos" }],
  },
];

export function getSeoPageByPath(path: string): SeoPageMeta | undefined {
  return CONTENT_SEO_PAGES.find((p) => p.path === path);
}

export const ALL_PRERENDER_PATHS = ["/", ...CONTENT_SEO_PAGES.map((p) => p.path)];
