import type { BusinessNicheId } from "./businessNiche";

export type ServicePrice = {
  name: string;
  price: string;
  notes?: string;
};

const MAX_ITEMS = 40;
const MAX_NAME = 80;
const MAX_PRICE = 40;

/** Serviços típicos por nicho — o dono só preenche o valor. */
export const NICHE_SERVICE_TEMPLATES: Record<BusinessNicheId, string[]> = {
  barbearia: [
    "Corte masculino",
    "Barba",
    "Corte + barba",
    "Sobrancelha",
    "Pezinho / acabamento",
    "Pigmentação de barba",
  ],
  salao: [
    "Corte feminino",
    "Escova",
    "Hidratação",
    "Coloração",
    "Luzes / mechas",
    "Progressiva / alisamento",
  ],
  manicure: [
    "Manicure",
    "Pedicure",
    "Esmaltação em gel",
    "Alongamento",
    "Manutenção",
    "Nail art",
  ],
  estetica: [
    "Limpeza de pele",
    "Design de sobrancelha",
    "Depilação",
    "Massagem",
    "Peeling",
    "Micropigmentação",
  ],
  outro: ["Serviço principal", "Serviço adicional"],
};

export function nicheServiceLabel(niche: BusinessNicheId | null): string {
  switch (niche) {
    case "barbearia":
      return "Tabela da barbearia";
    case "salao":
      return "Tabela do salão";
    case "manicure":
      return "Tabela de unhas";
    case "estetica":
      return "Tabela de estética";
    case "outro":
      return "Tabela de serviços";
    default:
      return "Valores dos serviços";
  }
}

export function templatesForNiche(niche: BusinessNicheId): ServicePrice[] {
  return NICHE_SERVICE_TEMPLATES[niche].map((name) => ({ name, price: "" }));
}

export function normalizeServicePricesFromApi(raw: unknown): ServicePrice[] {
  if (!Array.isArray(raw)) return [];
  const out: ServicePrice[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const src = item as Record<string, unknown>;
    const name = typeof src.name === "string" ? src.name.trim().slice(0, MAX_NAME) : "";
    const price =
      typeof src.price === "string"
        ? src.price.trim().slice(0, MAX_PRICE)
        : typeof src.price === "number" && Number.isFinite(src.price)
          ? String(src.price).slice(0, MAX_PRICE)
          : "";
    if (!name || !price) continue;
    out.push({ name, price });
    if (out.length >= MAX_ITEMS) break;
  }
  return out;
}

export function emptyServicePriceRow(): ServicePrice {
  return { name: "", price: "" };
}

/** Lista ainda sem preços preenchidos (só nomes ou vazia). */
export function hasNoFilledPrices(rows: ServicePrice[]): boolean {
  return !rows.some((r) => r.name.trim() && r.price.trim());
}

export function missingNicheSuggestions(
  niche: BusinessNicheId | null,
  rows: ServicePrice[],
): string[] {
  if (!niche) return [];
  const existing = new Set(
    rows.map((r) => r.name.trim().toLowerCase()).filter(Boolean),
  );
  return NICHE_SERVICE_TEMPLATES[niche].filter(
    (name) => !existing.has(name.toLowerCase()),
  );
}
