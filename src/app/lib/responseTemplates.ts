export type ResponseTemplates = {
  saudacao: string;
  apos_agendar: string;
  ao_cancelar: string;
  fora_horario: string;
  notas_ia: string;
};

export const EMPTY_RESPONSE_TEMPLATES: ResponseTemplates = {
  saudacao: "",
  apos_agendar: "",
  ao_cancelar: "",
  fora_horario: "",
  notas_ia: "",
};

export function normalizeTemplatesFromApi(raw: unknown): ResponseTemplates {
  if (!raw || typeof raw !== "object") return { ...EMPTY_RESPONSE_TEMPLATES };
  const src = raw as Record<string, unknown>;
  return {
    saudacao: typeof src.saudacao === "string" ? src.saudacao : "",
    apos_agendar: typeof src.apos_agendar === "string" ? src.apos_agendar : "",
    ao_cancelar: typeof src.ao_cancelar === "string" ? src.ao_cancelar : "",
    fora_horario: typeof src.fora_horario === "string" ? src.fora_horario : "",
    notas_ia: typeof src.notas_ia === "string" ? src.notas_ia : "",
  };
}

export const TEMPLATE_FIELDS: {
  key: keyof ResponseTemplates;
  label: string;
  hint: string;
  placeholder: string;
  rows?: number;
}[] = [
  {
    key: "notas_ia",
    label: "Personalidade (o mais importante)",
    hint: "Descreva o jeito de falar — amplo e livre. A IA usa isso como guia, não como texto pronto.",
    placeholder:
      "Ex.: Fale como uma secretária simpática e leve, do jeito brasileiro de WhatsApp. Trate o cliente pelo nome quando souber. Seja acolhedora sem exagero, objetiva e humana — nunca robótica. Pode usar “tá”, “pode ser”, “combinado”. Evite formalidade demais e não fique repetindo a mesma frase.",
    rows: 4,
  },
  {
    key: "saudacao",
    label: "Abertura / cumprimento",
    hint: "Só inspiração de clima (ex.: calorosa, rápida, descontraída). A IA varia a cada cliente.",
    placeholder:
      "Ex.: Cumprimente de forma calorosa e natural, como quem já conhece a casa; pergunte como pode ajudar sem soar de script.",
  },
  {
    key: "apos_agendar",
    label: "Quando o horário é confirmado",
    hint: "Clima desejado ao fechar o agendamento — a mensagem do sistema continua natural; a IA usa isso nas conversas.",
    placeholder:
      "Ex.: Confirme com tranquilidade, diga que está anotado e que a gente espera ele(a), sem soar automática.",
  },
  {
    key: "ao_cancelar",
    label: "Quando cancela",
    hint: "Tom ao cancelar: empático, sem drama, aberto a remarcar.",
    placeholder:
      "Ex.: Confirme o cancelamento de boa, sem culpa no cliente, e deixe a porta aberta pra remarcar.",
  },
  {
    key: "fora_horario",
    label: "Sem vaga / fora do horário",
    hint: "Como oferecer alternativa quando não dá pra marcar naquele momento.",
    placeholder:
      "Ex.: Explique com leveza que naquele horário não rola e sugira outras opções sem insistir demais.",
  },
];
