export type WagooPlanTier = "basic" | "pro" | "pro_plus";

export type WagooPlanCard = {
  tier: WagooPlanTier;
  name: string;
  priceBrl: number;
  maxUsers: number;
  description: string;
  highlight?: boolean;
  /** Diferenciais além dos recursos compartilhados */
  extras: string[];
};

export const WAGOO_PLAN_CARDS: WagooPlanCard[] = [
  {
    tier: "basic",
    name: "Basic",
    priceBrl: 59,
    maxUsers: 1,
    description: "1 usuário — ideal para profissional autônomo",
    extras: [],
  },
  {
    tier: "pro",
    name: "Pro",
    priceBrl: 149,
    maxUsers: 3,
    description: "Até 3 usuários na equipe com o mesmo WhatsApp",
    highlight: true,
    extras: [
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
    extras: [
      "Lembretes automáticos no WhatsApp antes do horário",
      "Export CSV de agendamentos para contabilidade",
      "Gerenciar equipe de profissionais",
    ],
  },
];

/** Recursos inclusos em todos os planos (landing / Pricing). */
export const WAGOO_SHARED_FEATURES = [
  "Atendimento automático no WhatsApp",
  "Integração com Google Agenda",
  "Agendamentos ilimitados com IA",
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
  return WAGOO_PLAN_CARDS.find((p) => p.tier === tier)?.name ?? tier;
}

/** Lembretes WhatsApp — só Pro e Pro+. */
export function tierSupportsReminders(tier: WagooPlanTier | null | undefined): boolean {
  return tier === "pro" || tier === "pro_plus";
}

/** Export CSV de agendamentos — só Pro e Pro+. */
export function tierSupportsCsvExport(tier: WagooPlanTier | null | undefined): boolean {
  return tier === "pro" || tier === "pro_plus";
}

/** Gerenciar equipe (múltiplos profissionais) — só Pro e Pro+. */
export function tierSupportsTeamManagement(tier: WagooPlanTier | null | undefined): boolean {
  return tier === "pro" || tier === "pro_plus";
}
