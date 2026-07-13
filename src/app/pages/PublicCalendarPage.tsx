import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, Sparkles } from "lucide-react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useParams } from "react-router";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type { BarberOption, CalendarEventItem } from "../lib/calendarTypes";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function PublicCalendarPage() {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const backendUrl =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
    "https://wag-backend.onrender.com";

  const monthCursor = useMemo(() => startOfMonth(new Date()), []);
  const [storeName, setStoreName] = useState("Loja");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [barbeiros, setBarbeiros] = useState<BarberOption[]>([]);
  const [selectedBarber, setSelectedBarber] = useState("all");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadEvents = useCallback(async () => {
    if (!slugParam) return;
    setLoading(true);
    setNotFound(false);
    try {
      const rangeStart = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 });
      const rangeEnd = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 1 });
      const barberQ =
        selectedBarber === "all"
          ? ""
          : `&barber=${encodeURIComponent(selectedBarber)}`;

      const res = await fetch(
        `${backendUrl}/api/calendar/public/${encodeURIComponent(slugParam)}/events?from=${encodeURIComponent(rangeStart.toISOString())}&to=${encodeURIComponent(rangeEnd.toISOString())}${barberQ}`,
      );

      if (res.status === 404) {
        setNotFound(true);
        setEvents([]);
        return;
      }

      if (!res.ok) {
        setEvents([]);
        return;
      }

      const data = await res.json();
      setStoreName(data.store_name ?? "Loja");
      setEvents(data.events ?? []);
      setBarbeiros(data.barbeiros ?? []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, slugParam, monthCursor, selectedBarber]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [monthCursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();
    for (const ev of events) {
      const key = format(parseISO(ev.start), "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
    for (const [, list] of map) {
      list.sort((a, b) => a.start.localeCompare(b.start));
    }
    return map;
  }, [events]);

  const selectedDayEvents = useMemo(() => {
    const key = format(selectedDate, "yyyy-MM-dd");
    return eventsByDay.get(key) ?? [];
  }, [eventsByDay, selectedDate]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <p className="font-black text-xl text-slate-900">Calendário indisponível</p>
          <p className="text-slate-500 mt-2 text-sm">Este link expirou ou foi desactivado pela loja.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
              <CalendarDays className="text-[#64b34d]" />
              {storeName}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Agenda pública — {format(monthCursor, "MMMM yyyy", { locale: ptBR })}
            </p>
          </div>
          <Select value={selectedBarber} onValueChange={setSelectedBarber}>
            <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl font-bold">
              <SelectValue placeholder="Profissional" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {barbeiros.map((b) => (
                <SelectItem key={b.id} value={b.nome}>
                  {b.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-8 p-6 lg:p-8 rounded-[32px] shadow-wg-elevated border-none">
            <div className="grid grid-cols-7 gap-1 lg:gap-2 mb-2 lg:mb-3">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-[10px] lg:text-xs font-black text-slate-400 lg:py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 lg:gap-2">
              {calendarDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const count = (eventsByDay.get(key) ?? []).length;
                const inMonth = isSameMonth(day, monthCursor);
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!inMonth}
                    onClick={() => inMonth && setSelectedDate(day)}
                    className={`min-h-[44px] lg:min-h-[88px] rounded-xl lg:rounded-2xl text-sm lg:text-lg font-bold ${
                      isSameDay(day, selectedDate)
                        ? "bg-[#64b34d] text-white"
                        : inMonth
                          ? "bg-slate-50 hover:bg-slate-100"
                          : "opacity-30"
                    }`}
                  >
                    {inMonth ? format(day, "d") : ""}
                    {inMonth && count > 0 && (
                      <span className="block text-[9px] lg:text-xs lg:mt-1">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
            {loading && (
              <p className="text-center text-xs text-slate-400 mt-4 flex justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Carregando…
              </p>
            )}
          </Card>

          <Card className="lg:col-span-4 p-6 rounded-[32px] shadow-wg-elevated border-none max-h-[520px] lg:max-h-none overflow-y-auto">
            <p className="font-black mb-4 lg:text-lg">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            <div className="space-y-3">
              {selectedDayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-2xl border border-slate-100 p-4 bg-white"
                >
                  <p className="font-bold text-slate-900">{ev.clientName || ev.summary}</p>
                  <p className="text-sm font-semibold text-[#64b34d] mt-1">
                    {format(parseISO(ev.start), "HH:mm")} – {format(parseISO(ev.end), "HH:mm")}
                  </p>
                  {ev.barberName && (
                    <p className="text-xs text-slate-500 mt-1">{ev.barberName}</p>
                  )}
                  {ev.source === "wagoo" && (
                    <Badge variant="outline" className="mt-2 text-[10px]">
                      <Sparkles size={10} className="mr-1" /> Wagoo
                    </Badge>
                  )}
                </div>
              ))}
              {!loading && selectedDayEvents.length === 0 && (
                <p className="text-slate-400 text-sm text-center py-6">Sem horários</p>
              )}
            </div>
          </Card>
        </div>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Powered by Wagoo
        </p>
      </div>
    </div>
  );
}
