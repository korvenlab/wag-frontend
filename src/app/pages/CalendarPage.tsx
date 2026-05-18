import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Phone,
  Sparkles,
  UserRound,
  Scissors,
} from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { FeedbackFab } from "../components/FeedbackFab";
import { supabase } from "../lib/supabase";

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

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function CalendarPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const backendUrl =
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
    "https://wag-backend.onrender.com";

  const [storeName, setStoreName] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getToken = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  };

  const loadProfile = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`${backendUrl}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) return;
    const data = await res.json();
    setStoreName(data.store_name || "");
    setGoogleConnected(!!(data.googleAuth && data.googleAuth.refreshToken));
  }, [backendUrl]);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) return;

      const rangeStart = startOfWeek(startOfMonth(monthCursor), { weekStartsOn: 1 });
      const rangeEnd = endOfWeek(endOfMonth(monthCursor), { weekStartsOn: 1 });

      const res = await fetch(
        `${backendUrl}/api/calendar/events?from=${encodeURIComponent(rangeStart.toISOString())}&to=${encodeURIComponent(rangeEnd.toISOString())}`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Não foi possível carregar a agenda.");
        setEvents([]);
        return;
      }

      const data = await res.json();
      setGoogleConnected(!!data.googleConnected);
      setEvents(data.events ?? []);
    } catch {
      setError("Erro de conexão ao carregar eventos.");
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, [backendUrl, monthCursor]);

  useEffect(() => {
    if (loading || !user) return;
    if (!user.hasPaid) {
      navigate("/#precos");
      return;
    }
    void loadProfile();
  }, [user, loading, navigate, loadProfile]);

  useEffect(() => {
    if (!user?.hasPaid) return;
    void loadEvents();
  }, [user, loadEvents]);

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

  const wagooMonthCount = useMemo(
    () => events.filter((e) => e.source === "wagoo" && isSameMonth(parseISO(e.start), monthCursor)).length,
    [events, monthCursor],
  );

  const handleConnectGoogle = async () => {
    if (!user?.email) return;
    setConnectingGoogle(true);
    try {
      const res = await fetch(
        `${backendUrl}/api/auth/google/url?email=${encodeURIComponent(user.email)}`,
      );
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      }
    } finally {
      setConnectingGoogle(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-green-50/50 blur-[120px] rounded-full -z-10" />

      <DashboardSidebar
        active="calendar"
        storeName={storeName}
        userEmail={user.email}
        onLogout={handleLogout}
      />

      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto mt-20 lg:mt-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <CalendarDays className="text-[#64b34d]" size={36} />
                Agenda
              </h1>
              <p className="text-slate-500 font-medium">
                Horários sincronizados com o Google Calendar — incluindo agendamentos feitos pela IA no WhatsApp.
              </p>
            </div>
            {googleConnected ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-4 py-2 text-xs font-bold">
                Google Calendar conectado
              </Badge>
            ) : (
              <Button
                onClick={() => void handleConnectGoogle()}
                disabled={connectingGoogle}
                className="rounded-xl bg-[#64b34d] hover:bg-[#4d8f3b] font-bold"
              >
                {connectingGoogle ? <Loader2 className="animate-spin" size={18} /> : "Conectar Google Agenda"}
              </Button>
            )}
          </div>

          {!googleConnected && (
            <Card className="rounded-[24px] border-amber-200 bg-amber-50/80">
              <CardContent className="pt-6 text-sm text-amber-900 font-medium">
                Conecte sua conta Google para ver os agendamentos aqui. A IA continuará marcando eventos no Google
                Agenda assim que a conexão estiver activa.
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3 rounded-[32px] border-none shadow-wg-elevated">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-xl font-black capitalize">
                    {format(monthCursor, "MMMM yyyy", { locale: ptBR })}
                  </CardTitle>
                  <CardDescription>
                    {wagooMonthCount} agendamento{wagooMonthCount === 1 ? "" : "s"} via Wagoo neste mês
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => setMonthCursor((m) => subMonths(m, 1))}
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-xl"
                    onClick={() => setMonthCursor((m) => addMonths(m, 1))}
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {WEEKDAYS.map((d) => (
                    <div
                      key={d}
                      className="text-center text-[10px] font-black uppercase tracking-wider text-slate-400 py-1"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const dayEvents = eventsByDay.get(key) ?? [];
                    const wagooCount = dayEvents.filter((e) => e.source === "wagoo").length;
                    const selected = isSameDay(day, selectedDate);
                    const inMonth = isSameMonth(day, monthCursor);

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedDate(day)}
                        className={`min-h-[52px] rounded-xl p-1 text-sm font-bold transition-all ${
                          selected
                            ? "bg-[#64b34d] text-white shadow-md"
                            : inMonth
                              ? "bg-slate-50 text-slate-800 hover:bg-slate-100"
                              : "bg-transparent text-slate-300"
                        }`}
                      >
                        <span>{format(day, "d")}</span>
                        {wagooCount > 0 && (
                          <span
                            className={`mt-1 mx-auto block h-1.5 w-1.5 rounded-full ${
                              selected ? "bg-white" : "bg-[#64b34d]"
                            }`}
                          />
                        )}
                        {wagooCount === 0 && dayEvents.length > 0 && (
                          <span className="mt-1 mx-auto block h-1.5 w-1.5 rounded-full bg-slate-300" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {loadingEvents && (
                  <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> A carregar eventos…
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 rounded-[32px] border-none shadow-wg-elevated">
              <CardHeader>
                <CardTitle className="text-lg font-black">
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </CardTitle>
                <CardDescription>
                  {selectedDayEvents.length === 0
                    ? "Nenhum compromisso neste dia"
                    : `${selectedDayEvents.length} evento(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[480px] overflow-y-auto">
                {error && (
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                )}
                {selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`rounded-2xl border p-4 space-y-2 ${
                      ev.source === "wagoo"
                        ? "border-[#64b34d]/30 bg-green-50/40"
                        : "border-slate-100 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {ev.clientName || ev.summary}
                        </p>
                        <p className="text-xs font-semibold text-[#64b34d] mt-0.5">
                          {format(parseISO(ev.start), "HH:mm")} – {format(parseISO(ev.end), "HH:mm")}
                        </p>
                      </div>
                      {ev.source === "wagoo" ? (
                        <Badge variant="outline" className="text-[10px] border-[#64b34d]/40 text-[#4d8f3b] shrink-0">
                          <Sparkles size={10} className="mr-1" /> Wagoo
                        </Badge>
                      ) : null}
                    </div>
                    {ev.barberName && (
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Scissors size={12} /> {ev.barberName}
                      </p>
                    )}
                    {ev.clientPhone && (
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Phone size={12} /> {ev.clientPhone}
                      </p>
                    )}
                    {!ev.clientName && ev.source === "other" && (
                      <p className="text-xs text-slate-500 line-clamp-2">{ev.summary}</p>
                    )}
                    {ev.htmlLink && (
                      <a
                        href={ev.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-[#64b34d]"
                      >
                        Abrir no Google <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ))}
                {!loadingEvents && selectedDayEvents.length === 0 && !error && googleConnected && (
                  <div className="text-center py-8 text-slate-400">
                    <UserRound className="mx-auto mb-2 opacity-40" size={32} />
                    <p className="text-sm font-medium">Dia livre — a IA pode preencher quando chegar um pedido.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <FeedbackFab />
    </div>
  );
}
