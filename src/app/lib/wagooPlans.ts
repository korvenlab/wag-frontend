export type WagooPlanTier = "agenda_web" | "basic" | "pro" | "pro_plus";

export type WagooPlanCard = {
  tier: WagooPlanTier;
  name: string;
  priceBrl: number;
  maxUsers: number;
  description: string;
  highlight?: boolean;
  kind: "booking" | "ai";
  /**
   * Landing: só o diferencial deste plano.
   * Basic = o que inclui; Pro = além do Basic; Pro+ = além do Pro.
   */
  landingDiff: string[];
  /** Página /precos: lista completa do que o plano oferece. */
  fullFeatures: string[];
};

/** Recursos base de todos os planos com IA (Basic e acima). */
export const WAGOO_AI_BASE_FEATURES = [
  "Atendimento automático no WhatsApp com IA",
  "Integração com Google Agenda",
  "Agendamentos ilimitados com IA",
  "Agenda Web inclusa (link público + vitrine)",
  "Clube de assinatura mensal para clientes (portal + Stripe)",
  "Tabela de preços por nicho (IA responde valores no WhatsApp)",
  "Estilo de conversa personalizado (tom humanizado)",
  "Sincronização em tempo real",
  "Painel com métricas de atendimento",
  "Suporte prioritário",
] as const;

const PRO_ADDS = [
  "Até 3 usuários na equipe (mesmo WhatsApp)",
  "Lembretes automáticos no WhatsApp antes do horário",
  "Analytics completo: caixa da loja, ganhos por profissional, planilha e lançamento rápido",
  "Gerenciar equipe de profissionais com agendas próprias",
] as const;

const PRO_PLUS_ADDS = ["Até 5 usuários na equipe"] as const;

/** Plano de agendamento web (sem IA conversacional). */
export const AGENDA_WEB_PLAN: WagooPlanCard = {
  tier: "agenda_web",
  name: "Agenda Web",
  priceBrl: 20,
  maxUsers: 0,
  description: "Link público para o cliente agendar, com confirmação e lembretes no WhatsApp",
  kind: "booking",
  landingDiff: [
    "Página pública com link exclusivo",
    "Confirmação e lembretes no WhatsApp da loja",
    "Profissionais ilimitados na vitrine",
    "Clube de assinatura mensal",
    "Sem IA no chat",
  ],
  fullFeatures: [
    "Página pública com link exclusivo",
    "Wizard: serviços → profissional → data → horário",
    "Profissionais ilimitados (barbeiros / atendentes)",
    "WhatsApp da loja (QR) — confirmação automática",
    "Lembretes no WhatsApp antes do horário",
    "Clube de assinatura mensal para clientes (portal + Stripe)",
    "Membros do clube agendam sem sinal (quando o sinal estiver ligado)",
    "Sincroniza com Google Agenda (opcional)",
    "Logo, capa, serviços, preços e fotos",
    "Sem atendimento com IA no WhatsApp",
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
    landingDiff: [
      "WhatsApp + IA + Google Agenda",
      "Agenda Web inclusa no painel",
      "Clube de assinatura mensal",
      "1 usuário",
    ],
    fullFeatures: [
      ...WAGOO_AI_BASE_FEATURES,
      "Membros do clube agendam sem sinal (quando o sinal estiver ligado)",
      "1 usuário (profissional autônomo)",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    priceBrl: 149,
    maxUsers: 3,
    description: "Até 3 usuários na equipe com o mesmo WhatsApp",
    highlight: true,
    kind: "ai",
    landingDiff: [
      "Tudo do Basic",
      "Até 3 usuários na equipe",
      "Lembretes automáticos no WhatsApp",
      "Analytics completo (caixa, ganhos e planilha)",
      "Gerenciar equipe",
    ],
    fullFeatures: [
      ...WAGOO_AI_BASE_FEATURES,
      "Membros do clube agendam sem sinal (quando o sinal estiver ligado)",
      ...PRO_ADDS,
    ],
  },
  {
    tier: "pro_plus",
    name: "Pro+",
    priceBrl: 259,
    maxUsers: 5,
    description: "Até 5 usuários para negócios em crescimento",
    kind: "ai",
    landingDiff: ["Tudo do Pro", "Até 5 usuários na equipe"],
    fullFeatures: [
      ...WAGOO_AI_BASE_FEATURES,
      "Membros do clube agendam sem sinal (quando o sinal estiver ligado)",
      ...PRO_ADDS.filter((x) => !x.startsWith("Até 3")),
      ...PRO_PLUS_ADDS,
    ],
  },
];

/** @deprecated Use WAGOO_AI_BASE_FEATURES — mantido para imports legados. */
export const WAGOO_SHARED_FEATURES = WAGOO_AI_BASE_FEATURES;

/** O que o Basic não tem — texto de vendas. */
export const WAGOO_BASIC_EXCLUSIONS = [
  "Lembretes automáticos no WhatsApp",
  "Analytics completo (caixa, ganhos e planilha)",
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

/**
 * Analytics completo (caixa, ganhos por profissional, planilha, lançamento rápido).
 * Só Pro e Pro+.
 */
export function tierSupportsAnalytics(tier: WagooPlanTier | null | undefined): boolean {
  return tier === "pro" || tier === "pro_plus";
}

/** Export CSV / planilha — alias de Analytics (Pro e Pro+). */
export function tierSupportsCsvExport(tier: WagooPlanTier | null | undefined): boolean {
  return tierSupportsAnalytics(tier);
}

/** Gerenciar equipe (múltiplos profissionais) — só Pro e Pro+. */
export function tierSupportsTeamManagement(tier: WagooPlanTier | null | undefined): boolean {
  return tier === "pro" || tier === "pro_plus";
}

/** Clube de assinatura mensal — incluso em todos os planos pagos. */
export function tierSupportsClub(tier: WagooPlanTier | null | undefined): boolean {
  return (
    tier === "agenda_web" ||
    tier === "basic" ||
    tier === "pro" ||
    tier === "pro_plus"
  );
}
