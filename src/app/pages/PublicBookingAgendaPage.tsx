import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

const API =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://wag-backend.onrender.com";

type DayInfo = {
  date: string;
  open: boolean;
  bookedCount: number;
  appointments: Array<{
    starts_at: string;
    ends_at: string;
    service?: string;
    provider?: string;
  }>;
};

export function PublicBookingAgendaPage() {
  const { slug } = useParams<{ slug: string }>();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [storeName, setStoreName] = useState("");
  const [daysMap, setDaysMap] = useState<Record<string, DayInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const from = format(startOfMonth(month), "yyyy-MM-dd");
  const to = format(endOfMonth(month), "yyyy-MM-dd");

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API}/api/booking/public/${encodeURIComponent(slug)}/calendar?from=${from}&to=${to}`,
        );
        if (res.status === 404) {
          setError("Agenda não encontrada ou não publicada.");
          return;
        }
        if (!res.ok) throw new Error("fail");
        const data = await res.json();
        setStoreName(data.store_name || "");
        const map: Record<string, DayInfo> = {};
        for (const d of data.days ?? []) map[d.date] = d;
        setDaysMap(map);
      } catch {
        setError("Não foi possível carregar a agenda.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, from, to]);

  const cells = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const selectedDay = selected ? daysMap[selected] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <header className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64b34d]">
            Agenda pública
          </p>
          <h1 className="text-2xl font-black tracking-tight">{storeName || "Agenda"}</h1>
          <p className="text-sm text-white/50 font-medium">
            Veja dias livres e horários já marcados — sem dados pessoais do cliente.
          </p>
        </header>

        {error ? (
          <p className="text-center text-red-400 font-semibold text-sm">{error}</p>
        ) : null}

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="p-2 rounded-xl border border-white/10"
              onClick={() => setMonth((m) => startOfMonth(addDays(m, -15)))}
              aria-label="Mês anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="font-black capitalize">
              {format(month, "MMMM yyyy", { locale: ptBR })}
            </p>
            <button
              type="button"
              className="p-2 rounded-xl border border-white/10"
              onClick={() => setMonth((m) => startOfMonth(addDays(endOfMonth(m), 1)))}
              aria-label="Próximo mês"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-white/35">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <div key={`${d}-${i}`}>{d}</div>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[#64b34d]" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {cells.map((d) => {
                const ymd = format(d, "yyyy-MM-dd");
                const info = daysMap[ymd];
                const inMonth = isSameMonth(d, month);
                const booked = (info?.bookedCount ?? 0) > 0;
                const open = info?.open;
                return (
                  <button
                    key={ymd}
                    type="button"
                    disabled={!inMonth || !info}
                    onClick={() => setSelected(ymd)}
                    className={
                      "aspect-square rounded-xl text-sm font-bold transition " +
                      (!inMonth
                        ? "text-white/15"
                        : selected === ymd
                          ? "bg-[#64b34d] text-white"
                          : booked
                            ? "bg-amber-500/25 text-amber-100 border border-amber-500/30"
                            : open
                              ? "bg-[#64b34d]/15 text-[#9ae07f] border border-[#64b34d]/25"
                              : "bg-white/5 text-white/30")
                    }
                  >
                    {format(d, "d")}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#64b34d]/60" /> Livre
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" /> Com marcações
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" /> Fechado
            </span>
          </div>
        </div>

        {selectedDay ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 space-y-3">
            <p className="font-black">
              {format(new Date(selectedDay.date + "T12:00:00"), "EEEE, d MMM", { locale: ptBR })}
            </p>
            {!selectedDay.open ? (
              <p className="text-sm text-white/50">Fechado neste dia.</p>
            ) : selectedDay.bookedCount === 0 ? (
              <p className="text-sm text-[#9ae07f] font-semibold">Nenhum horário marcado — livre.</p>
            ) : (
              <ul className="space-y-2">
                {selectedDay.appointments.map((a, i) => (
                  <li
                    key={`${a.starts_at}-${i}`}
                    className="rounded-xl border border-white/10 px-3 py-2 text-sm"
                  >
                    <span className="font-bold">
                      {format(new Date(a.starts_at), "HH:mm")}–
                      {format(new Date(a.ends_at), "HH:mm")}
                    </span>
                    <span className="text-white/50">
                      {" "}
                      · {a.service || "Serviço"}
                      {a.provider ? ` · ${a.provider}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {slug ? (
          <Link
            to={`/a/${slug}`}
            className="block w-full text-center py-4 rounded-2xl bg-[#64b34d] font-black text-white"
          >
            Quero agendar
          </Link>
        ) : null}

        <p className="text-center text-xs text-white/30 pb-8">Powered by Wagoo</p>
      </div>
    </div>
  );
}
