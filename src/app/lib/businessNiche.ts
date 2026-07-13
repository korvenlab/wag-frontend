export const BUSINESS_NICHE_IDS = [
  "barbearia",
  "salao",
  "manicure",
  "estetica",
  "outro",
] as const;

export type BusinessNicheId = (typeof BUSINESS_NICHE_IDS)[number];

export type BusinessNicheOption = {
  id: BusinessNicheId;
  label: string;
  description: string;
};

export const BUSINESS_NICHE_OPTIONS: BusinessNicheOption[] = [
  {
    id: "barbearia",
    label: "Barbearia",
    description: "Cortes masculinos, barba e grooming",
  },
  {
    id: "salao",
    label: "Salão de beleza",
    description: "Cabelo, coloração e visual completo",
  },
  {
    id: "manicure",
    label: "Manicure / unhas",
    description: "Unhas, nail design e cuidados das mãos",
  },
  {
    id: "estetica",
    label: "Estética",
    description: "Limpeza de pele, procedimentos e bem-estar",
  },
  {
    id: "outro",
    label: "Outro",
    description: "Descreva o tipo do seu negócio",
  },
];

export function isBusinessNicheId(value: unknown): value is BusinessNicheId {
  return typeof value === "string" && (BUSINESS_NICHE_IDS as readonly string[]).includes(value);
}
