export type WagooPlanTier = "agenda_web" | "basic" | "pro" | "pro_plus";

export type WagooPlanCard = {
  tier: WagooPlanTier;
  name: string;
  priceBrl: number;
  maxUsers: number;
  description: string;
  highlight?: boolean;
  kind: "booking" | "ai";
  /** Diferenciais além dos recursos compartilhados */
  extras: string[];
};

/** Plano de agendamento web (sem IA conversacional). */
export const AGENDA_WEB_PLAN: WagooPlanCard = {
  tier: "agenda_web",
  name: "Agenda Web",
  priceBrl: 20,
  maxUsers: 0,
  description: "Link público para o cliente agendar, com confirmação e lembretes no WhatsApp",
  highlight: true,
  kind: "booking",
  extras: [
    "Página pública com link exclusivo",
    "Wizard: serviços → profissional → data → horário",
    "Profissionais ilimitados (barbeiros / atendentes)",
    "WhatsApp da loja (QR) — confirmação automática",
    "Lembretes no WhatsApp antes do horário",
    "Sincroniza com Google Agenda (opcional)",
    "Logo, capa, serviços, preços e fotos",
  ],
};

export const WAGOO_PLAN_CARDS: WagooPlanCard[] = [
  {
    tier: "basic",
    name: "Basic",
    priceBrl: 59,
    maxUsers: 1,
    description: "1 usuário — ideal para profissional autônomo",
    kind: "ai",
    extras: ["Agenda Web inclusa no painel"],
  },
  {
    tier: "pro",
    name: "Pro",
    priceBrl: 149,
    maxUsers: 3,
    description: "Até 3 usuários na equipe com o mesmo WhatsApp",
    kind: "ai",
    extras: [
      "Agenda Web inclusa no painel",
      "Lembretes automáticos no WhatsApp antes do horário",
      "Export CSV de agendamentos para contabilidade",
      "Gerenciar equipe de profissionais",
    ],
  },
  {
    tier: "pro_plus",
    name: "Pro+",
    priceBrl: 259,
    maxUsers: 5,
    description: "Até 5 usuários para negócios em crescimento",
    kind: "ai",
    extras: [
      "Agenda Web inclusa no painel",
      "Lembretes automáticos no WhatsApp antes do horário",
      "Export CSV de agendamentos para contabilidade",
      "Gerenciar equipe de profissionais",
    ],
  },
];

/** Recursos inclusos em todos os planos com IA (landing / Pricing). */
export const WAGOO_SHARED_FEATURES = [
  "Atendimento automático no WhatsApp",
  "Integração com Google Agenda",
  "Agendamentos ilimitados com IA",
  "Agenda Web inclusa (link público + vitrine)",
  "Tabela de preços por nicho (IA responde valores no WhatsApp)",
  "Estilo de conversa personalizado (tom humanizado)",
  "Sincronização em tempo real",
  "Painel com métricas de atendimento",
  "Suporte prioritário",
] as const;

/** O que o Basic não tem — texto de vendas. */
export const WAGOO_BASIC_EXCLUSIONS = [
  "Lembretes automáticos no WhatsApp",
  "Export CSV de agendamentos",
  "Gerenciar equipe (Pro / Pro+)",
] as const;

export function planLabel(tier: WagooPlanTier | null | undefined): string {
  if (!tier) return "Sem plano";
  if (tier === "agenda_web") return AGENDA_WEB_PLAN.name;
  return WAGOO_PLAN_CARDS.find((p) => p.tier === tier)?.name ?? tier;
}

export function tierSupportsAi(tier: WagooPlanTier | null | undefined): boolean {
  return tier === "basic" || tier === "pro" || tier === "pro_plus";
}

/** Agenda Web (link / vitrine) — standalone ou inclusa nos planos com IA. */
export function tierSupportsPublicBooking(tier: WagooPlanTier | null | undefined): boolean {
  return (
    tier === "agenda_web" ||
    tier === "basic" ||
    tier === "pro" ||
    tier === "pro_plus"
  );
}

/** Só Agenda Web — sem dashboard de IA. */
export function tierIsAgendaWebOnly(tier: WagooPlanTier | null | undefined): boolean {
  return tier === "agenda_web";
}

/** Lembretes WhatsApp — Agenda Web, Pro e Pro+. */
export function tierSupportsReminders(tier: WagooPlanTier | null | undefined): boolean {
  return tier === "agenda_web" || tier === "pro" || tier === "pro_plus";
}

/** Export CSV de agendamentos — só Pro e Pro+. */
export function tierSupportsCsvExport(tier: WagooPlanTier | null | undefined): boolean {
  return tier === "pro" || tier === "pro_plus";
}

/** Gerenciar equipe (múltiplos profissionais) — só Pro e Pro+. */
export function tierSupportsTeamManagement(tier: WagooPlanTier | null | undefined): boolean {
  return tier === "pro" || tier === "pro_plus";
}
