export type CalendarEventItem = {
  id: string;
  summary: string;
  description: string | null;
  start: string;
  end: string;
  htmlLink: string | null;
  source: "wagoo" | "other";
  clientName: string | null;
  clientPhone: string | null;
  barberName: string | null;
};

export type BarberOption = { id: string; nome: string; ativo?: boolean };
