import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  QrCode,
  Bot, Phone, MessageSquare, Bell,
  CalendarCheck, Zap, Loader2, Check, Coffee, Moon, Sun, Copy, Download, MessageSquareText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router";
import { FeedbackFab } from "../components/FeedbackFab";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { PlanFeatureGate } from "../components/PlanFeatureGate";
import { apiFetch } from "../lib/apiFetch";
import { planLabel, tierSupportsCsvExport, tierSupportsReminders } from "../lib/wagooPlans";
import {
  BUSINESS_NICHE_OPTIONS,
  isBusinessNicheId,
  type BusinessNicheId,
} from "../lib/businessNiche";
import {
  getCachedDashboardProfile,
  setCachedDashboardProfile,
  setCachedTeam,
} from "../lib/dashboardCache";
import {
  EMPTY_RESPONSE_TEMPLATES,
  TEMPLATE_FIELDS,
  normalizeTemplatesFromApi,
  type ResponseTemplates,
} from "../lib/responseTemplates";

const REMIND_PRESETS = [15, 30, 60, 120] as const;

function defaultCsvRange(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromDateInputStart(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString();
}

function fromDateInputEnd(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
}

const DAYS_OF_WEEK = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

const INITIAL_DAY_CONFIG = {
  startTime: "08:00", endTime: "12:00", isTurno1Active: true,
  startTime2: "14:00", endTime2: "18:00", isTurno2Active: true,
  startTime3: "19:00", endTime3: "22:00", isTurno3Active: false,
};

const defaultWorkingHours = () =>
  DAYS_OF_WEEK.reduce(
    (acc, day) => ({ ...acc, [day]: { ...INITIAL_DAY_CONFIG } }),
    {} as Record<string, typeof INITIAL_DAY_CONFIG>,
  );

export function Dashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedDay, setSelectedDay] = useState("Segunda-feira");

  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [waStatus, setWaStatus] = useState<"idle" | "waiting_qr" | "connecting" | "connected">("idle");
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const [showHoursSuccess, setShowHoursSuccess] = useState(false);
  const [showSettingsSuccess, setShowSettingsSuccess] = useState(false);
  const [isCancelingSubscription, setIsCancelingSubscription] = useState(false);
  const [cancelSubscriptionError, setCancelSubscriptionError] = useState<string | null>(null);

  const [workingHours, setWorkingHours] = useState<Record<string, any>>(defaultWorkingHours);
  const [serviceDuration, setServiceDuration] = useState<number>(30);
  const [storeName, setStoreName] = useState("");
  const [businessNiche, setBusinessNiche] = useState<BusinessNicheId | null>(null);
  const [businessNicheCustom, setBusinessNicheCustom] = useState("");
  const [messagesAnswered, setMessagesAnswered] = useState(0);
  const [appointmentsMade, setAppointmentsMade] = useState(0);
  const [profileHydrating, setProfileHydrating] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [remindBeforeMinutes, setRemindBeforeMinutes] = useState(60);
  const [isSavingReminders, setIsSavingReminders] = useState(false);
  const [showRemindersSuccess, setShowRemindersSuccess] = useState(false);
  const [responseTemplates, setResponseTemplates] = useState<ResponseTemplates>({
    ...EMPTY_RESPONSE_TEMPLATES,
  });
  const [isSavingTemplates, setIsSavingTemplates] = useState(false);
  const [showTemplatesSuccess, setShowTemplatesSuccess] = useState(false);
  const [csvRange, setCsvRange] = useState(defaultCsvRange);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [csvExportError, setCsvExportError] = useState<string | null>(null);

  const { user, loading, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const profileLoadedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading || !user || !user.hasPaid) return;

    const applyCached = () => {
      const cached = getCachedDashboardProfile(user.id);
      if (cached) {
        setStoreName(cached.store_name || user.storeName || "");
        setBusinessNiche(
          isBusinessNicheId(cached.business_niche) ? cached.business_niche : user.businessNiche,
        );
        setBusinessNicheCustom(
          cached.business_niche_custom || user.businessNicheCustom || "",
        );
        setIsAIEnabled(cached.is_ai_enabled ?? true);
        setIsWhatsAppConnected(!!cached.whatsapp_connected);
        setMessagesAnswered(cached.messages_answered || 0);
        setAppointmentsMade(cached.appointments_made || 0);
        setServiceDuration(cached.service_duration || 30);
        setIsGoogleConnected(!!cached.google_connected);
        setRemindersEnabled(!!cached.reminders_enabled);
        setRemindBeforeMinutes(cached.remind_before_minutes || 60);
        if (cached.working_hours && Object.keys(cached.working_hours).length > 0) {
          setWorkingHours(cached.working_hours);
        }
        setProfileHydrating(false);
        return true;
      }
      if (user.storeName) setStoreName(user.storeName);
      if (user.businessNiche) setBusinessNiche(user.businessNiche);
      if (user.businessNicheCustom) setBusinessNicheCustom(user.businessNicheCustom);
      return false;
    };

    const hadCache = applyCached();
    if (profileLoadedForRef.current === user.id && hadCache) return;
    profileLoadedForRef.current = user.id;

    const fetchUserData = async () => {
      try {
        const response = await apiFetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setStoreName(data.store_name || "");
          setBusinessNiche(
            isBusinessNicheId(data.business_niche) ? data.business_niche : null,
          );
          setBusinessNicheCustom(
            typeof data.business_niche_custom === "string"
              ? data.business_niche_custom
              : "",
          );
          setIsAIEnabled(data.is_ai_enabled ?? true);
          setIsWhatsAppConnected(!!data.whatsapp_connected);
          setMessagesAnswered(data.messages_answered || 0);
          setAppointmentsMade(data.appointments_made || 0);
          setServiceDuration(data.service_duration || 30);
          setIsGoogleConnected(!!data.google_connected);
          setRemindersEnabled(!!data.reminders_enabled);
          setRemindBeforeMinutes(
            typeof data.remind_before_minutes === "number" ? data.remind_before_minutes : 60,
          );
          setResponseTemplates(normalizeTemplatesFromApi(data.response_templates));

          if (data.working_hours && Object.keys(data.working_hours).length > 0) {
            setWorkingHours(data.working_hours);
          } else {
            setWorkingHours(defaultWorkingHours());
          }

          setCachedDashboardProfile(user.id, {
            store_name: data.store_name || "",
            business_niche: isBusinessNicheId(data.business_niche)
              ? data.business_niche
              : null,
            business_niche_custom:
              typeof data.business_niche_custom === "string"
                ? data.business_niche_custom
                : null,
            is_ai_enabled: data.is_ai_enabled ?? true,
            whatsapp_connected: !!data.whatsapp_connected,
            google_connected: !!data.google_connected,
            messages_answered: data.messages_answered || 0,
            appointments_made: data.appointments_made || 0,
            service_duration: data.service_duration || 30,
            working_hours:
              data.working_hours && Object.keys(data.working_hours).length > 0
                ? data.working_hours
                : null,
            reminders_enabled: !!data.reminders_enabled,
            remind_before_minutes:
              typeof data.remind_before_minutes === "number" ? data.remind_before_minutes : 60,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      } finally {
        setProfileHydrating(false);
      }
    };

    void fetchUserData();
    // Prefetch equipe em background para a próxima navegação
    void apiFetch("/api/barbeiros")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setCachedTeam(user.id, data.barbeiros ?? []);
      })
      .catch(() => undefined);
  }, [user?.id, user?.hasPaid, user?.storeName, user?.businessNiche, user?.businessNicheCustom, loading]);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate("/login");
      else if (!user.hasPaid) navigate("/#precos");
    }
  }, [user?.id, user?.hasPaid, loading, navigate]);

  useEffect(() => {
    const section = (location.state as { section?: string } | null)?.section;
    if (
      section &&
      ["overview", "analytics", "hours", "reminders", "settings"].includes(section)
    ) {
      setActiveSection(section);
    }
  }, [location.state]);

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleGenerateQR = async () => {
    setIsLoadingQR(true);
    setQrCode(null);
    setWaStatus("waiting_qr");
    try {
      const response = await apiFetch("/api/whatsapp/qr", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.connected || data.status === "connected") {
          setIsWhatsAppConnected(true);
          setQrCode(null);
          setWaStatus("connected");
        } else if (data.status === "connecting") {
          setWaStatus("connecting");
        } else if (data.qrCode) {
          setQrCode(data.qrCode);
          setWaStatus("waiting_qr");
        }
      }
    } catch (error) {
      console.error(error);
      setWaStatus("idle");
    } finally {
      setIsLoadingQR(false);
    }
  };

  // Poll: QR renovado (~15s) e status connecting pós-scan (515) a cada 2s.
  useEffect(() => {
    if (isWhatsAppConnected) return;
    if (waStatus !== "waiting_qr" && waStatus !== "connecting") return;

    const intervalMs = waStatus === "connecting" ? 2_000 : 15_000;
    const id = window.setInterval(() => {
      void (async () => {
        try {
          const response = await apiFetch("/api/whatsapp/qr", {
            method: "POST",
            body: JSON.stringify({}),
          });
          if (!response.ok) return;
          const data = await response.json();
          if (data.connected || data.status === "connected") {
            setIsWhatsAppConnected(true);
            setQrCode(null);
            setWaStatus("connected");
          } else if (data.status === "connecting") {
            setWaStatus("connecting");
          } else if (typeof data.qrCode === "string") {
            setQrCode(data.qrCode);
            setWaStatus("waiting_qr");
          }
        } catch {
          /* ignore */
        }
      })();
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [waStatus, isWhatsAppConnected]);

  const handleDisconnectWhatsApp = async () => {
    setIsDisconnecting(true);
    try {
      const response = await apiFetch("/api/whatsapp/disconnect", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (response.ok) {
        setIsWhatsAppConnected(false);
        setQrCode(null);
        setWaStatus("idle");
        setShowConfirmDisconnect(false);
      }
    } catch (error) { console.error("Erro ao desconectar:", error); } finally { setIsDisconnecting(false); }
  };

  const handleToggleAI = async (checked: boolean) => {
    setIsAIEnabled(checked);
    setIsSavingAI(true);
    try {
      await apiFetch("/api/settings/ai", {
        method: "POST",
        body: JSON.stringify({ is_ai_enabled: checked }),
      });
    } catch (error) { 
      setIsAIEnabled(!checked); 
    } finally { 
      setIsSavingAI(false); 
    }
  };

  const handleSaveReminders = async () => {
    setIsSavingReminders(true);
    setShowRemindersSuccess(false);
    try {
      const response = await apiFetch("/api/settings/reminders", {
        method: "POST",
        body: JSON.stringify({
          remindersEnabled,
          remindBeforeMinutes,
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        alert(body?.error || "Não foi possível salvar os lembretes.");
        return;
      }
      const data = await response.json();
      setRemindersEnabled(!!data.reminders_enabled);
      setRemindBeforeMinutes(
        typeof data.remind_before_minutes === "number"
          ? data.remind_before_minutes
          : remindBeforeMinutes,
      );
      if (user?.id) {
        const cached = getCachedDashboardProfile(user.id);
        if (cached) {
          setCachedDashboardProfile(user.id, {
            ...cached,
            reminders_enabled: !!data.reminders_enabled,
            remind_before_minutes:
              typeof data.remind_before_minutes === "number"
                ? data.remind_before_minutes
                : remindBeforeMinutes,
          });
        }
      }
      setShowRemindersSuccess(true);
      window.setTimeout(() => setShowRemindersSuccess(false), 2500);
    } catch {
      alert("Erro de rede ao salvar lembretes.");
    } finally {
      setIsSavingReminders(false);
    }
  };

  const handleSaveTemplates = async () => {
    setIsSavingTemplates(true);
    setShowTemplatesSuccess(false);
    try {
      const response = await apiFetch("/api/settings/templates", {
        method: "POST",
        body: JSON.stringify({ responseTemplates }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        alert(body?.error || "Não foi possível salvar os templates.");
        return;
      }
      const data = await response.json();
      setResponseTemplates(normalizeTemplatesFromApi(data.response_templates));
      setShowTemplatesSuccess(true);
      window.setTimeout(() => setShowTemplatesSuccess(false), 2500);
    } catch {
      alert("Erro de rede ao salvar templates.");
    } finally {
      setIsSavingTemplates(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    setCsvExportError(null);
    try {
      const qs = new URLSearchParams({
        from: csvRange.from,
        to: csvRange.to,
      });
      const response = await apiFetch(`/api/calendar/events/export?${qs.toString()}`);
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setCsvExportError(body?.error || "Não foi possível exportar o CSV.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wagoo-agendamentos-${toDateInputValue(csvRange.from)}_${toDateInputValue(csvRange.to)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setCsvExportError("Erro de rede ao exportar CSV.");
    } finally {
      setIsExportingCsv(false);
    }
  };

  const updateDayField = (day: string, field: string, value: any) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const copyToAllDays = () => {
    const currentConfig = { ...workingHours[selectedDay] };
    const newSchedule = DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: { ...currentConfig }
    }), {});
    setWorkingHours(newSchedule);
  };

  const handleSaveHours = async () => {
    setIsSavingHours(true);
    try {
      const response = await apiFetch("/api/settings/hours", {
        method: "POST",
        body: JSON.stringify({ 
          workingHours: workingHours, 
          serviceDuration: serviceDuration 
        }),
      });
      if (response.ok) {
        setShowHoursSuccess(true);
        setTimeout(() => setShowHoursSuccess(false), 3000);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsSavingHours(false); 
    }
  };

  const handleSaveSettings = async () => {
    if (!businessNiche) return;
    if (businessNiche === "outro" && businessNicheCustom.trim().length < 2) return;
    setIsSavingSettings(true);
    try {
      const response = await apiFetch("/api/settings/store", {
        method: "POST",
        body: JSON.stringify({
          storeName: storeName,
          businessNiche,
          businessNicheCustom:
            businessNiche === "outro" ? businessNicheCustom.trim() : undefined,
        }),
      });
      if (response.ok) {
        await refreshProfile({ force: true });
        setShowSettingsSuccess(true);
        setTimeout(() => setShowSettingsSuccess(false), 3000);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsSavingSettings(false); 
    }
  };

  const handleCancelSubscription = async () => {
    setCancelSubscriptionError(null);
    setIsCancelingSubscription(true);
    try {
      const response = await apiFetch("/api/stripe/create-billing-portal-session", {
        method: "POST",
        body: JSON.stringify({}),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) {
        setCancelSubscriptionError(
          data.error || "Não foi possível abrir o cancelamento da assinatura.",
        );
        return;
      }
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      setCancelSubscriptionError("Erro de conexão ao abrir o portal da Stripe.");
    } finally {
      setIsCancelingSubscription(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#64b34d]" />
      </div>
    );
  }

  if (!user || !user.hasPaid) return null;

  const sidebarActive =
    activeSection === "overview" ||
    activeSection === "analytics" ||
    activeSection === "hours" ||
    activeSection === "reminders" ||
    activeSection === "settings"
      ? activeSection
      : "overview";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-green-50/50 blur-[120px] rounded-full -z-10" />

      <DashboardSidebar
        active={sidebarActive}
        storeName={storeName}
        userEmail={user.email}
        onLogout={handleLogout}
      />

      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-20 lg:mt-32 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Olá, {storeName ? storeName.split(' ')[0] : 'Admin'}
              </h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">Sua assistente está pronta para agendar.</p>
              {user.subscriptionTier ? (
                <p className="text-sm font-bold text-slate-600">
                  Plano {planLabel(user.subscriptionTier)}
                  {user.maxTeamUsers > 0
                    ? ` · até ${user.maxTeamUsers} profissional(is) na equipe`
                    : ""}
                </p>
              ) : null}
            </div>
            
            {isGoogleConnected && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 shadow-wg-subtle text-emerald-600 text-[10px] font-black uppercase tracking-[0.1em]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Google Calendar Sincronizado
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeSection === "overview" && (
              <>
                <div className="lg:col-span-2">
                  <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white overflow-hidden">
                    <CardHeader className="pb-2 pt-8 px-8 border-b border-slate-50">
                       <CardTitle className="text-xs font-black flex items-center gap-2 tracking-[0.15em] uppercase text-slate-400">
                         <Phone size={14} className="text-[#64b34d]" />
                         Conexão WhatsApp
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-10">
                      <div className="relative w-48 h-48 bg-white border border-slate-100 rounded-3xl flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
                        {isLoadingQR ? <Loader2 className="animate-spin text-[#64b34d]" /> : 
                         isWhatsAppConnected ? (
                           <div className="text-center">
                             <Check className="text-[#64b34d] w-12 h-12 mx-auto" strokeWidth={3} />
                             <span className="text-[#64b34d] font-black text-[10px] uppercase block mt-3 tracking-[0.2em]">Ativo</span>
                           </div>
                         ) :
                         qrCode || waStatus === "connecting" ? (
                           <div className="relative w-full h-full">
                             {qrCode ? (
                               <img src={qrCode} className="w-full h-full p-3" alt="QR Code" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center">
                                 <QrCode className="text-slate-100 w-12 h-12" />
                               </div>
                             )}
                             {waStatus === "connecting" ? (
                               <div className="absolute inset-0 bg-white/85 flex flex-col items-center justify-center gap-2 px-4 text-center">
                                 <Loader2 className="animate-spin text-[#64b34d] w-8 h-8" />
                                 <span className="text-slate-900 font-black text-xs tracking-wide">
                                   Conectando…
                                 </span>
                                 <span className="text-slate-500 text-[10px] font-medium leading-snug">
                                   Finalize no celular se pedir confirmação
                                 </span>
                               </div>
                             ) : null}
                           </div>
                         ) : <QrCode className="text-slate-100 w-12 h-12" />}
                      </div>
                      
                      <div className="space-y-5 text-center sm:text-left flex-1">
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-900 text-lg tracking-tight">Status da Conexão</h4>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
                            {isWhatsAppConnected 
                              ? "O Wagoo está operando e agendando seus clientes automaticamente." 
                              : "Conecte seu WhatsApp para que a IA comece a gerenciar seus horários."}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                          <Button onClick={handleGenerateQR} disabled={isLoadingQR || isWhatsAppConnected} className="rounded-xl h-11 px-6 bg-slate-900 text-white font-bold text-sm hover:bg-[#64b34d] transition-colors">
                            Gerar Novo QR
                          </Button>
                          {isWhatsAppConnected && (
                            <Button variant="outline" className="rounded-xl h-11 px-5 border-red-50 text-red-500 font-bold text-sm hover:bg-red-50" onClick={() => setShowConfirmDisconnect(true)}>
                              Desconectar
                            </Button>
                          )}
                        </div>
                        {showConfirmDisconnect && (
                          <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-4 mt-2">
                            <span className="text-xs font-bold text-red-700">Confirmar?</span>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-red-600 text-white px-4" onClick={handleDisconnectWhatsApp} disabled={isDisconnecting}>Sim</Button>
                              <Button size="sm" variant="ghost" className="text-slate-500" onClick={() => setShowConfirmDisconnect(false)}>Não</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-wg-cta">
                        <Bot size={22} />
                      </div>
                      <Switch checked={isAIEnabled} onCheckedChange={handleToggleAI} disabled={isSavingAI} className="data-[state=checked]:bg-[#64b34d]" />
                    </div>
                    <h3 className="font-black text-lg text-slate-900 tracking-tight">Cérebro da IA</h3>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                      {isAIEnabled ? "Ativa e respondendo." : "A IA está pausada."}
                    </p>
                  </Card>
                </div>
              </>
            )}

            {activeSection === "reminders" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3">
                {tierSupportsReminders(user.subscriptionTier) ? (
                  <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white p-8 md:p-10 space-y-6 max-w-xl">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-[#64b34d]">
                        <Bell size={22} />
                      </div>
                      <Switch
                        checked={remindersEnabled}
                        onCheckedChange={setRemindersEnabled}
                        disabled={isSavingReminders}
                        className="data-[state=checked]:bg-[#64b34d]"
                      />
                    </div>
                    <div>
                      <h3 className="font-black text-2xl text-slate-900 tracking-tight">
                        Lembretes no WhatsApp
                      </h3>
                      <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
                        Configure quando avisar o cliente. Depois do lembrete, ele pode confirmar
                        presença ou avisar se não puder vir — com linguagem natural. O envio só
                        acontece com o WhatsApp conectado na Visão Geral.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Antecedência
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {REMIND_PRESETS.map((m) => (
                          <button
                            key={m}
                            type="button"
                            disabled={!remindersEnabled || isSavingReminders}
                            onClick={() => setRemindBeforeMinutes(m)}
                            className={`px-3 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-40 ${
                              remindBeforeMinutes === m
                                ? "bg-[#64b34d] text-white shadow-wg-subtle"
                                : "bg-slate-50 text-slate-600 border border-slate-100 hover:border-slate-200"
                            }`}
                          >
                            {m} min
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        type="button"
                        onClick={() => void handleSaveReminders()}
                        disabled={isSavingReminders}
                        className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-[#64b34d] text-white font-black"
                      >
                        {isSavingReminders ? <Loader2 className="animate-spin" /> : "Salvar lembretes"}
                      </Button>
                      {showRemindersSuccess ? (
                        <p className="absolute -bottom-6 left-0 right-0 text-center text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em]">
                          ✓ Salvo
                        </p>
                      ) : null}
                    </div>
                  </Card>
                ) : (
                  <PlanFeatureGate
                    icon={Bell}
                    title="Lembretes disponíveis no Pro e Pro+"
                    description="No plano Basic esta função não está inclusa. Faça upgrade para o Pro ou Pro+ e avise seus clientes automaticamente minutos antes do horário."
                  />
                )}
              </motion.div>
            )}

            {activeSection === "hours" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3">
                {profileHydrating ? (
                  <p className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                    Atualizando horários…
                  </p>
                ) : null}
                <Card className="rounded-[40px] border-none shadow-wg-elevated bg-white">
                  <div className="p-10 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-50">
                    <div className="text-center sm:text-left">
                      <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter">Horários da Loja</CardTitle>
                      <CardDescription className="text-base font-medium text-slate-400">Gerencie sua disponibilidade semanal.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={copyToAllDays} className="rounded-xl border-slate-100 text-xs font-black hover:bg-slate-50 gap-2 h-11 px-5">
                      <Copy size={14} /> Replicar para todos os dias
                    </Button>
                  </div>

                  <div className="bg-slate-50/50 p-4 flex overflow-x-auto gap-2 no-scrollbar border-b border-slate-50">
                    {DAYS_OF_WEEK.map(day => (
                      <button 
                        key={day} 
                        onClick={() => setSelectedDay(day)} 
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                          selectedDay === day ? "bg-slate-900 text-white shadow-wg-card" : "bg-white text-slate-400 border border-slate-100 shadow-wg-subtle"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  <CardContent className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                      <TurnoCard 
                        title="Manhã" 
                        icon={<Sun size={20} />} 
                        active={workingHours[selectedDay]?.isTurno1Active || false} 
                        onToggle={(v: boolean) => updateDayField(selectedDay, "isTurno1Active", v)} 
                        start={workingHours[selectedDay]?.startTime || "08:00"} 
                        end={workingHours[selectedDay]?.endTime || "12:00"} 
                        onStart={(v: string) => updateDayField(selectedDay, "startTime", v)} 
                        onEnd={(v: string) => updateDayField(selectedDay, "endTime", v)} 
                      />
                      <TurnoCard 
                        title="Tarde" 
                        icon={<Coffee size={20} />} 
                        active={workingHours[selectedDay]?.isTurno2Active || false} 
                        onToggle={(v: boolean) => updateDayField(selectedDay, "isTurno2Active", v)} 
                        start={workingHours[selectedDay]?.startTime2 || "14:00"} 
                        end={workingHours[selectedDay]?.endTime2 || "18:00"} 
                        onStart={(v: string) => updateDayField(selectedDay, "startTime2", v)} 
                        onEnd={(v: string) => updateDayField(selectedDay, "endTime2", v)} 
                      />
                      <TurnoCard 
                        title="Noite" 
                        icon={<Moon size={20} />} 
                        active={workingHours[selectedDay]?.isTurno3Active || false} 
                        onToggle={(v: boolean) => updateDayField(selectedDay, "isTurno3Active", v)} 
                        start={workingHours[selectedDay]?.startTime3 || "19:00"} 
                        end={workingHours[selectedDay]?.endTime3 || "22:00"} 
                        onStart={(v: string) => updateDayField(selectedDay, "startTime3", v)} 
                        onEnd={(v: string) => updateDayField(selectedDay, "endTime3", v)} 
                      />
                    </div>

                    <div className="pt-10 flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="flex items-center gap-5 bg-slate-50 px-6 py-4 rounded-[28px] border border-slate-100">
                        <Label className="text-xs font-black text-slate-900 uppercase tracking-[0.15em]">Tempo de Serviço:</Label>
                        <div className="flex items-center gap-3">
                          <Input type="number" value={serviceDuration} onChange={(e) => setServiceDuration(Number(e.target.value))} className="w-16 bg-white border-none rounded-xl font-bold h-10 text-center text-lg shadow-sm" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Min</span>
                        </div>
                      </div>
                      
                      <div className="relative w-full md:w-auto">
                        <Button onClick={handleSaveHours} disabled={isSavingHours} className="w-full md:w-64 h-14 rounded-2xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black text-base shadow-wg-green-cta transition-[box-shadow,background-color]">
                          {isSavingHours ? <Loader2 className="animate-spin" /> : "Salvar Configuração"}
                        </Button>
                        {showHoursSuccess && (
                          <p className="absolute -bottom-8 left-0 right-0 text-center text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em]">✓ Agenda Atualizada</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === "analytics" && (
              <>
                <AnalyticsCard icon={<MessageSquare size={22} className="text-emerald-500" />} title="Conversas" value={messagesAnswered} />
                <AnalyticsCard icon={<CalendarCheck size={22} className="text-emerald-600" />} title="Agendados" value={appointmentsMade} />
                <AnalyticsCard icon={<Zap size={22} className="text-amber-500" />} title="Tempo Ganho" value={`${(appointmentsMade * 5 / 60).toFixed(1)}h`} />

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3">
                  {tierSupportsCsvExport(user.subscriptionTier) ? (
                    <Card className="rounded-[32px] border-none shadow-wg-elevated bg-white p-8 md:p-10 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-[#64b34d] shrink-0">
                          <Download size={22} />
                        </div>
                        <div>
                          <h3 className="font-black text-xl text-slate-900 tracking-tight">
                            Exportar agendamentos (CSV)
                          </h3>
                          <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed">
                            Baixe o período para contabilidade: data, cliente, telefone e profissional.
                            Requer Google Agenda conectado.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            De
                          </Label>
                          <Input
                            type="date"
                            value={toDateInputValue(csvRange.from)}
                            onChange={(e) =>
                              setCsvRange((prev) => ({
                                ...prev,
                                from: fromDateInputStart(e.target.value),
                              }))
                            }
                            className="h-11 rounded-xl bg-slate-50 border-none font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Até
                          </Label>
                          <Input
                            type="date"
                            value={toDateInputValue(csvRange.to)}
                            onChange={(e) =>
                              setCsvRange((prev) => ({
                                ...prev,
                                to: fromDateInputEnd(e.target.value),
                              }))
                            }
                            className="h-11 rounded-xl bg-slate-50 border-none font-bold"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setCsvRange(defaultCsvRange())}
                          className="rounded-xl h-10 text-xs font-black"
                        >
                          Este mês
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const to = new Date();
                            const from = new Date();
                            from.setDate(from.getDate() - 30);
                            setCsvRange({
                              from: from.toISOString(),
                              to: to.toISOString(),
                            });
                          }}
                          className="rounded-xl h-10 text-xs font-black"
                        >
                          Últimos 30 dias
                        </Button>
                      </div>
                      <Button
                        type="button"
                        onClick={() => void handleExportCsv()}
                        disabled={isExportingCsv || !isGoogleConnected}
                        className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-[#64b34d] text-white font-black gap-2"
                      >
                        {isExportingCsv ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <>
                            <Download size={16} /> Baixar CSV
                          </>
                        )}
                      </Button>
                      {!isGoogleConnected && (
                        <p className="text-amber-600 text-xs font-bold">
                          Conecte o Google Agenda na Visão Geral para exportar.
                        </p>
                      )}
                      {csvExportError && (
                        <p className="text-red-600 text-xs font-medium">{csvExportError}</p>
                      )}
                    </Card>
                  ) : (
                    <PlanFeatureGate
                      icon={Download}
                      title="Export CSV disponível no Pro e Pro+"
                      description="No plano Basic esta função não está inclusa. Faça upgrade para baixar seus agendamentos em CSV para contabilidade."
                    />
                  )}
                </motion.div>
              </>
            )}

            {activeSection === "settings" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3">
                <Card className="rounded-[40px] border-none shadow-wg-elevated bg-white p-10">
                  <div className="mb-10">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Configurações do Perfil</h3>
                    <p className="text-slate-500 font-medium mt-1 text-base leading-relaxed">
                      Nome da loja e nicho — a IA usa isso para falar com seus clientes no tom certo.
                    </p>
                  </div>
                  <div className="space-y-8 max-w-lg">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome de Exibição</Label>
                      <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-lg focus-visible:ring-1 focus-visible:ring-[#64b34d]" />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nicho do negócio</Label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {BUSINESS_NICHE_OPTIONS.map((opt) => {
                          const active = businessNiche === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setBusinessNiche(opt.id)}
                              className={`text-left rounded-2xl border-2 px-4 py-3 transition-all ${
                                active
                                  ? "border-[#64b34d] bg-green-50/60"
                                  : "border-slate-100 hover:border-slate-200"
                              }`}
                            >
                              <p className="font-black text-slate-900 text-sm">{opt.label}</p>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{opt.description}</p>
                            </button>
                          );
                        })}
                      </div>
                      {businessNiche === "outro" && (
                        <Input
                          value={businessNicheCustom}
                          onChange={(e) => setBusinessNicheCustom(e.target.value)}
                          placeholder="Ex.: Studio de sobrancelhas"
                          className="h-12 px-4 rounded-2xl bg-slate-50 border-none font-bold"
                        />
                      )}
                    </div>
                    <Button
                      onClick={handleSaveSettings}
                      disabled={
                        isSavingSettings ||
                        !businessNiche ||
                        (businessNiche === "outro" && businessNicheCustom.trim().length < 2)
                      }
                      className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-base transition-all hover:bg-slate-800"
                    >
                      {isSavingSettings ? <Loader2 className="animate-spin" /> : "Salvar Alterações"}
                    </Button>
                    {showSettingsSuccess && <p className="text-emerald-600 text-xs font-black text-center uppercase tracking-widest">✓ Perfil Atualizado</p>}

                    <div className="pt-8 border-t border-slate-100 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-50 text-[#64b34d] flex items-center justify-center">
                          <MessageSquareText size={18} />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-lg tracking-tight">
                            Estilo de conversa
                          </h4>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Guia de tom e personalidade. A IA <span className="font-bold text-slate-700">não copia</span> o
                            texto — improvisa respostas naturais (sempre curtas, 1–2 frases).
                          </p>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed mt-2">
                            <span className="font-bold text-slate-700">Pode deixar em branco</span> — a IA usa o estilo
                            padrão do Wagoo e funciona normalmente. Preencha só se quiser personalizar o jeito de falar.
                          </p>
                        </div>
                      </div>
                      {TEMPLATE_FIELDS.map((field) => (
                        <div key={field.key} className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                            {field.label}
                          </Label>
                          <p className="text-[11px] text-slate-400 font-medium ml-1">{field.hint}</p>
                          <Textarea
                            value={responseTemplates[field.key]}
                            onChange={(e) =>
                              setResponseTemplates((prev) => ({
                                ...prev,
                                [field.key]: e.target.value.slice(0, 800),
                              }))
                            }
                            placeholder={field.placeholder}
                            rows={field.rows ?? 2}
                            className="min-h-[72px] px-4 py-3 rounded-2xl bg-slate-50 border-none font-medium text-sm resize-y"
                          />
                        </div>
                      ))}
                      <div className="relative">
                        <Button
                          type="button"
                          onClick={() => void handleSaveTemplates()}
                          disabled={isSavingTemplates}
                          className="w-full h-12 rounded-2xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black"
                        >
                          {isSavingTemplates ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            "Salvar estilo de conversa"
                          )}
                        </Button>
                        {showTemplatesSuccess ? (
                          <p className="absolute -bottom-6 left-0 right-0 text-center text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em]">
                            ✓ Estilo salvo
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                        Assinatura
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => void handleCancelSubscription()}
                        disabled={isCancelingSubscription}
                        className="h-9 px-4 text-xs font-bold rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                      >
                        {isCancelingSubscription ? (
                          <Loader2 className="animate-spin w-3.5 h-3.5" />
                        ) : (
                          "Cancelar assinatura"
                        )}
                      </Button>
                      {cancelSubscriptionError && (
                        <p className="text-xs text-red-600 font-medium">{cancelSubscriptionError}</p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <FeedbackFab />
    </div>
  );
}

function TurnoCard({ title, icon, active, onToggle, start, end, onStart, onEnd }: any) {
  return (
    <div className={`p-8 rounded-[32px] border-2 transition-all duration-300 ${
      active ? "bg-white border-[#64b34d]/20 shadow-wg-turno" : "bg-slate-50/50 border-transparent opacity-60"
    }`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-green-50 text-[#64b34d]" : "bg-slate-100 text-slate-400"}`}>
            {icon}
          </div>
          <span className="font-black text-slate-900 text-base tracking-tight">{title}</span>
        </div>
        <Switch checked={active} onCheckedChange={onToggle} className="data-[state=checked]:bg-[#64b34d]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Input type="time" value={start} onChange={(e) => onStart(e.target.value)} disabled={!active} className="h-11 bg-slate-50 border-none rounded-xl font-black text-center text-sm shadow-inner" />
        </div>
        <div className="space-y-1.5">
          <Input type="time" value={end} onChange={(e) => onEnd(e.target.value)} disabled={!active} className="h-11 bg-slate-50 border-none rounded-xl font-black text-center text-sm shadow-inner" />
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({ icon, title, value }: any) {
  return (
    <Card className="rounded-[40px] border-none shadow-wg-card bg-white p-8 h-full flex flex-col justify-between transition-[box-shadow,transform] hover:translate-y-[-5px] hover:shadow-wg-analytics-hover">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 tracking-[0.2em]">{title}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</p>
      </div>
    </Card>
  );
}
