export type WagooPlanTier = "basic" | "pro" | "pro_plus";

export type WagooPlanCard = {
  tier: WagooPlanTier;
  name: string;
  priceBrl: number;
  maxUsers: number;
  description: string;
  highlight?: boolean;
};

export const WAGOO_PLAN_CARDS: WagooPlanCard[] = [
  {
    tier: "basic",
    name: "Basic",
    priceBrl: 59,
    maxUsers: 1,
    description: "1 usuário — ideal para profissional autônomo",
  },
  {
    tier: "pro",
    name: "Pro",
    priceBrl: 149,
    maxUsers: 3,
    description: "Até 3 usuários na equipe com o mesmo WhatsApp",
    highlight: true,
  },
  {
    tier: "pro_plus",
    name: "Pro+",
    priceBrl: 259,
    maxUsers: 5,
    description: "Até 5 usuários para negócios em crescimento",
  },
];

export const WAGOO_SHARED_FEATURES = [
  "Atendimento automático no WhatsApp",
  "Integração com Google Agenda",
  "Agendamentos ilimitados com IA",
  "Sincronização em tempo real",
  "Painel com métricas de atendimento",
  "Suporte prioritário",
] as const;

export function planLabel(tier: WagooPlanTier | null | undefined): string {
  if (!tier) return "Sem plano";
  return WAGOO_PLAN_CARDS.find((p) => p.tier === tier)?.name ?? tier;
}
