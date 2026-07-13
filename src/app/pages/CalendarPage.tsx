import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Copy,
  Link2,
  Loader2,
  Sparkles,
} from "lucide-react";
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
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuth } from "../context/AuthContext";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { FeedbackFab } from "../components/FeedbackFab";
import { supabase } from "../lib/supabase";
import type { BarberOption, CalendarEventItem } from "../lib/calendarTypes";

export type { CalendarEventItem } from "../lib/calendarTypes";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function CalendarPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const backendUrl =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
    "https://wag-backend.onrender.com";

  const monthCursor = useMemo(() => startOfMonth(new Date()), []);

  const [storeName, setStoreName] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [barbeiros, setBarbeiros] = useState<BarberOption[]>([]);
  const [selectedBarber, setSelectedBarber] = useState("all");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const calendarLoadStateRef = useRef<{ userId: string | null; loaded: boolean }>({
    userId: null,
    loaded: false,
  });

  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const loadShare = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`${backendUrl}/api/calendar/share`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      setShareUrl(data.shareUrl ?? null);
    }
  }, [backendUrl]);

  const loadEvents = useCallback(async (options?: { background?: boolean }) => {
    if (!options?.background) setLoadingEvents(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;

      const rangeStart = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 });
      const rangeEnd = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 1 });
      const barberQ =
        selectedBarber === "all"
          ? ""
          : `&barber=${encodeURIComponent(selectedBarber)}`;

      const res = await fetch(
        `${backendUrl}/api/calendar/events?from=${encodeURIComponent(rangeStart.toISOString())}&to=${encodeURIComponent(rangeEnd.toISOString())}${barberQ}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Não foi possível carregar o calendário.");
        setEvents([]);
        return;
      }

      const data = await res.json();
      setEvents(data.events ?? []);
      setBarbeiros(data.barbeiros ?? []);
      if (data.store_name) setStoreName(data.store_name);
    } catch {
      setError("Erro de conexão ao carregar eventos.");
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, [backendUrl, monthCursor, selectedBarber]);

  useEffect(() => {
    if (loading || !user) return;
    if (!user.hasPaid) {
      navigate("/#precos");
      return;
    }
    void loadShare();
  }, [user?.id, user?.hasPaid, loading, navigate, loadShare]);

  useEffect(() => {
    if (!user?.hasPaid) return;
    const background =
      calendarLoadStateRef.current.userId === user.id &&
      calendarLoadStateRef.current.loaded;
    void loadEvents({ background });
    calendarLoadStateRef.current = { userId: user.id, loaded: true };
  }, [user?.id, user?.hasPaid, loadEvents]);

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

  const copyShare = async () => {
    setShareLoading(true);
    try {
      let url = shareUrl;
      if (!url) {
        const token = await getToken();
        const res = await fetch(`${backendUrl}/api/calendar/share`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        const data = await res.json();
        if (res.ok && data.shareUrl) {
          url = data.shareUrl;
          setShareUrl(url);
        }
      }
      if (url) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setShareLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#64b34d]" />
      </div>
    );
  }

  if (!user?.hasPaid) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardSidebar
        active="calendar"
        storeName={storeName}
        userEmail={user.email}
        onLogout={() => {
          logout();
          navigate("/login");
        }}
      />

      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto mt-20 lg:mt-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <CalendarDays className="text-[#64b34d]" size={36} />
                Calendário
              </h1>
              <p className="text-slate-500 font-medium">
                {storeName || "Sua loja"} — {format(monthCursor, "MMMM yyyy", { locale: ptBR })}
              </p>
            </div>
            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
              <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl font-bold">
                <SelectValue placeholder="Profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os profissionais</SelectItem>
                {barbeiros.map((b) => (
                  <SelectItem key={b.id} value={b.nome}>
                    {b.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card className="rounded-2xl border-slate-200 bg-white p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Link2 size={18} className="text-[#64b34d]" />
              Link para o cliente ver a agenda e escolher um horário, sem precisar entrar no sistema
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl font-bold gap-2"
              disabled={shareLoading}
              onClick={() => void copyShare()}
            >
              {shareLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Copy size={16} />
              )}
              {copied ? "Copiado!" : shareUrl ? "Copiar link público" : "Gerar e copiar link"}
            </Button>
          </Card>

          <div className="grid lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3 rounded-[32px] border-none shadow-wg-elevated p-6">
              <p className="text-xl font-black capitalize mb-4">
                {format(monthCursor, "MMMM yyyy", { locale: ptBR })}
              </p>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] font-black uppercase text-slate-400 py-1"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const count = (eventsByDay.get(key) ?? []).length;
                  const selected = isSameDay(day, selectedDate);
                  const inMonth = isSameMonth(day, monthCursor);
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!inMonth}
                      onClick={() => inMonth && setSelectedDate(day)}
                      className={`min-h-[48px] rounded-xl text-sm font-bold ${
                        selected
                          ? "bg-[#64b34d] text-white"
                          : inMonth
                            ? "bg-slate-50 hover:bg-slate-100"
                            : "opacity-30"
                      }`}
                    >
                      {inMonth ? format(day, "d") : ""}
                      {inMonth && count > 0 && (
                        <span className="block text-[9px] mt-0.5">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {loadingEvents && (
                <p className="text-center text-xs text-slate-400 mt-4 flex justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Carregando…
                </p>
              )}
            </Card>

            <Card className="lg:col-span-2 rounded-[32px] border-none shadow-wg-elevated p-6 max-h-[560px] overflow-y-auto">
              <p className="font-black text-lg mb-1">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                {selectedDayEvents.length} agendamento(s)
              </p>
              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
              <div className="space-y-3">
                {selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`rounded-2xl border p-4 ${
                      ev.source === "wagoo"
                        ? "border-[#64b34d]/30 bg-green-50/40"
                        : "border-slate-100"
                    }`}
                  >
                    <p className="font-bold text-slate-900">
                      {ev.clientName || ev.summary}
                    </p>
                    <p className="text-sm font-semibold text-[#64b34d] mt-1">
                      {format(parseISO(ev.start), "HH:mm")} –{" "}
                      {format(parseISO(ev.end), "HH:mm")}
                    </p>
                    {ev.barberName && (
                      <p className="text-xs text-slate-500 mt-1">Profissional: {ev.barberName}</p>
                    )}
                    {ev.source === "wagoo" && (
                      <Badge variant="outline" className="mt-2 text-[10px]">
                        <Sparkles size={10} className="mr-1" /> Wagoo
                      </Badge>
                    )}
                  </div>
                ))}
                {!loadingEvents && selectedDayEvents.length === 0 && !error && (
                  <p className="text-slate-400 text-sm text-center py-8">Nenhum horário neste dia</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
      <FeedbackFab />
    </div>
  );
}
