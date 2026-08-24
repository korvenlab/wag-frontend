import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Wallet, CheckCircle2 } from "lucide-react";

const API =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "https://wag-backend.onrender.com";

type ScheduleAppointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  day: string;
  time_label: string;
  client_name: string;
  service_name: string | null;
  price_brl: number;
  payment_status: string | null;
  status: string;
};

type CommissionPayload = {
  profissional: string;
  store_name: string | null;
  period: { year: number; month: number; label: string };
  commission_percent: number;
  paid_appointments_count: number;
  faturamento_brl: number;
  auto_commission_brl: number;
  manual_amount_brl: number | null;
  final_amount_brl: number;
  source: "automatic" | "manual" | "none";
  appointments: ScheduleAppointment[];
  busy_days: string[];
  payout: {
    paid: boolean;
    paid_at: string | null;
    amount_brl: number | null;
    note: string | null;
  };
};

function money(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

function paymentLabel(appt: ScheduleAppointment) {
  if (appt.payment_status === "paid") return "Pago";
  if (appt.status === "pending_payment") return "Aguardando pagamento";
  if (appt.status === "completed") return "Concluído";
  return "Confirmado";
}

function formatPaidAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDayHeading(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/** Grade do mês (dom–sáb), só marcação visual dos dias com horário. */
function MonthCalendar({
  year,
  month,
  busyDays,
  selectedDay,
  onSelectDay,
}: {
  year: number;
  month: number;
  busyDays: Set<string>;
  selectedDay: string | null;
  onSelectDay: (day: string | null) => void;
}) {
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startPad = first.getDay(); // 0 = domingo

  const cells: Array<{ day: number | null; ymd: string | null }> = [];
  for (let i = 0; i < startPad; i++) cells.push({ day: null, ymd: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const ymd = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, ymd });
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-wider text-white/35">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((w, i) => (
          <span key={`${w}-${i}`}>{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c.day || !c.ymd) {
            return <div key={`e-${i}`} className="aspect-square" />;
          }
          const busy = busyDays.has(c.ymd);
          const selected = selectedDay === c.ymd;
          return (
            <button
              key={c.ymd}
              type="button"
              disabled={!busy}
              onClick={() => onSelectDay(selected ? null : c.ymd)}
              className={`aspect-square rounded-xl text-sm font-bold transition-colors ${
                selected
                  ? "bg-[#64b34d] text-white"
                  : busy
                    ? "bg-[#64b34d]/20 text-white hover:bg-[#64b34d]/35"
                    : "text-white/25"
              }`}
            >
              {c.day}
              {busy ? (
                <span className="mx-auto mt-0.5 block h-1 w-1 rounded-full bg-[#64b34d]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Página pública: ganhos (Analytics) + agenda do profissional — sem Stripe. */
export function PublicCommissionPage() {
  const { token = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<CommissionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const year = Number(searchParams.get("year")) || undefined;
  const month = Number(searchParams.get("month")) || undefined;

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (year && month) {
      p.set("year", String(year));
      p.set("month", String(month));
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  }, [year, month]);

  const load = useCallback(async () => {
    if (!token) {
      setError("Link inválido.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API}/api/barbeiros/public/commission/${encodeURIComponent(token)}${qs}`,
      );
      const json = (await res.json().catch(() => ({}))) as CommissionPayload & {
        error?: string;
      };
      if (!res.ok) {
        setData(null);
        setError(json.error || "Não foi possível carregar a comissão.");
        return;
      }
      setData({
        ...json,
        appointments: Array.isArray(json.appointments) ? json.appointments : [],
        busy_days: Array.isArray(json.busy_days) ? json.busy_days : [],
        payout: json.payout ?? {
          paid: false,
          paid_at: null,
          amount_brl: null,
          note: null,
        },
      });
      setSelectedDay(null);
    } catch {
      setData(null);
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [token, qs]);

  useEffect(() => {
    void load();
  }, [load]);

  const goMonth = (delta: number) => {
    if (!data) return;
    const next = shiftMonth(data.period.year, data.period.month, delta);
    setSearchParams({ year: String(next.year), month: String(next.month) });
  };

  const busySet = useMemo(
    () => new Set(data?.busy_days ?? []),
    [data?.busy_days],
  );

  const visibleAppointments = useMemo(() => {
    const list = data?.appointments ?? [];
    if (!selectedDay) return list;
    return list.filter((a) => a.day === selectedDay);
  }, [data?.appointments, selectedDay]);

  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleAppointment[]>();
    for (const a of visibleAppointments) {
      const arr = map.get(a.day) ?? [];
      arr.push(a);
      map.set(a.day, arr);
    }
    return [...map.entries()];
  }, [visibleAppointments]);

  const sourceLabel =
    data?.source === "manual"
      ? "Valor final da planilha / lançamento (Analytics)"
      : data?.source === "automatic"
        ? `Soma das comissões dos atendimentos pagos (${data.commission_percent}%)`
        : "Sem ganhos neste mês no Analytics";

  return (
    <div className="min-h-screen bg-[#0c1210] text-white">
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(100,179,77,0.35), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(100,179,77,0.12), transparent)",
        }}
      />
      <div className="relative mx-auto max-w-lg px-5 py-10 sm:py-14">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white/80 transition-colors"
        >
          Wagoo
        </Link>

        {loading ? (
          <div className="mt-24 flex flex-col items-center gap-3 text-white/60">
            <Loader2 className="h-8 w-8 animate-spin text-[#64b34d]" />
            <p className="text-sm font-medium">Carregando seus ganhos…</p>
          </div>
        ) : error ? (
          <div className="mt-20 rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
            <p className="text-lg font-bold text-white">{error}</p>
            <p className="mt-2 text-sm text-white/50">
              Peça um novo link a quem administra a equipe.
            </p>
          </div>
        ) : data ? (
          <div className="mt-10 space-y-8">
            <header className="space-y-2">
              {data.store_name ? (
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#64b34d]/90">
                  {data.store_name}
                </p>
              ) : null}
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                {data.profissional}
              </h1>
              <p className="text-white/55 font-medium">
                Seus ganhos e horários do mês — só você vê este link.
              </p>
            </header>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goMonth(-1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-center text-sm font-bold uppercase tracking-widest text-white/70">
                {data.period.label}
              </p>
              <button
                type="button"
                onClick={() => goMonth(1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                aria-label="Próximo mês"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-[28px] border border-[#64b34d]/25 bg-gradient-to-b from-[#64b34d]/15 to-transparent p-8 shadow-[0_0_60px_-20px_rgba(100,179,77,0.5)]">
              <div className="flex items-center gap-2 text-[#64b34d]">
                <Wallet className="h-5 w-5" />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Total Analytics do mês
                </span>
              </div>
              <p className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                {money(data.final_amount_brl)}
              </p>
              <p className="mt-2 text-sm text-white/50 font-medium">{sourceLabel}</p>
              {data.payout?.paid ? (
                <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-200">
                      Repasse recebido
                      {data.payout.paid_at
                        ? ` em ${formatPaidAt(data.payout.paid_at)}`
                        : ""}
                    </p>
                    {data.payout.amount_brl != null ? (
                      <p className="text-xs text-emerald-200/70 font-medium mt-0.5">
                        Valor repassado: {money(data.payout.amount_brl)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <p className="mt-3 text-[11px] text-white/35 font-medium leading-relaxed">
                Mesmo valor do Analytics: soma das comissões dos atendimentos
                pagos no app
                {data.manual_amount_brl != null
                  ? " e o valor lançado na planilha (quando houver)."
                  : "."}
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <dt className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Atendimentos pagos
                </dt>
                <dd className="mt-1 text-2xl font-black">
                  {data.paid_appointments_count}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <dt className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Faturamento dos seus serviços
                </dt>
                <dd className="mt-1 text-2xl font-black">
                  {money(data.faturamento_brl)}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <dt className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Comissão app ({data.commission_percent}%)
                </dt>
                <dd className="mt-1 text-2xl font-black">
                  {money(data.auto_commission_brl)}
                </dd>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
                <dt className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Planilha / lançamento
                </dt>
                <dd className="mt-1 text-2xl font-black">
                  {data.manual_amount_brl != null
                    ? money(data.manual_amount_brl)
                    : "—"}
                </dd>
              </div>
            </dl>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#64b34d]">
                <CalendarDays className="h-5 w-5" />
                <h2 className="text-[11px] font-black uppercase tracking-widest">
                  Seus horários
                </h2>
              </div>
              <p className="text-sm text-white/45 font-medium">
                {data.appointments.length === 0
                  ? "Nenhum horário marcado com você neste mês na Agenda."
                  : `${data.appointments.length} horário(s) marcado(s) com você. Toque em um dia para filtrar.`}
              </p>

              <MonthCalendar
                year={data.period.year}
                month={data.period.month}
                busyDays={busySet}
                selectedDay={selectedDay}
                onSelectDay={setSelectedDay}
              />

              {selectedDay ? (
                <button
                  type="button"
                  className="text-xs font-bold text-[#64b34d] hover:underline"
                  onClick={() => setSelectedDay(null)}
                >
                  Ver todos os dias
                </button>
              ) : null}

              <div className="space-y-5">
                {grouped.length === 0 ? null : (
                  grouped.map(([day, items]) => (
                    <div key={day} className="space-y-2">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40">
                        {formatDayHeading(day)}
                      </p>
                      <ul className="space-y-2">
                        {items.map((a) => (
                          <li
                            key={a.id}
                            className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-bold text-white">{a.time_label}</p>
                                <p className="mt-0.5 text-sm text-white/70 font-medium">
                                  {a.client_name}
                                  {a.service_name ? ` · ${a.service_name}` : ""}
                                </p>
                                <p className="mt-1 text-[11px] font-semibold text-white/40">
                                  {paymentLabel(a)}
                                </p>
                              </div>
                              {a.price_brl > 0 ? (
                                <p className="text-sm font-black text-[#64b34d] shrink-0">
                                  {money(a.price_brl)}
                                </p>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
