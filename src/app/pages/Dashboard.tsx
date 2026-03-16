import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar, LayoutDashboard, Clock, Settings, LogOut, Menu, X, QrCode,
  Bot, RefreshCw, Phone, CheckCircle2, BarChart3, MessageSquare,
  CalendarCheck, Zap, Loader2, Check, Timer, Coffee, Moon, Sun, Copy, AlertTriangle, Link2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

const DAYS_OF_WEEK = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

const INITIAL_DAY_CONFIG = {
  startTime: "08:00", endTime: "12:00", isTurno1Active: true,
  startTime2: "14:00", endTime2: "18:00", isTurno2Active: true,
  startTime3: "19:00", endTime3: "22:00", isTurno3Active: false,
};

export function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedDay, setSelectedDay] = useState("Segunda-feira");

  // Estados de controle do Backend
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false); // NOVO: Status Google

  // Estados de Feedback Visual
  const [showHoursSuccess, setShowHoursSuccess] = useState(false);
  const [showSettingsSuccess, setShowSettingsSuccess] = useState(false);

  // Estado de Horários
  const [workingHours, setWorkingHours] = useState<Record<string, any>>({});
  const [serviceDuration, setServiceDuration] = useState<number>(30);
  const [storeName, setStoreName] = useState("");

  // Métricas
  const [messagesAnswered, setMessagesAnswered] = useState(0);
  const [appointmentsMade, setAppointmentsMade] = useState(0);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.email) return;
      try {
        const response = await fetch(`${backendUrl}/api/user/profile?email=${user.email}`);
        if (response.ok) {
          const data = await response.json();
          setStoreName(data.store_name || "");
          setIsAIEnabled(data.is_ai_enabled ?? true);
          setIsWhatsAppConnected(!!data.whatsapp_session);
          setMessagesAnswered(data.messages_answered || 0);
          setAppointmentsMade(data.appointments_count || 0);
          setServiceDuration(data.service_duration || 30);
          
          // Verifica se o objeto googleAuth existe e tem o refreshToken
          setIsGoogleConnected(!!(data.googleAuth && data.googleAuth.refreshToken));

          if (data.working_hours) {
            setWorkingHours(data.working_hours);
          } else {
            const initialSchedule = DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: { ...INITIAL_DAY_CONFIG } }), {});
            setWorkingHours(initialSchedule);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      }
    };
    if (user && user.hasPaid) fetchUserData();
  }, [user, backendUrl]);

  useEffect(() => {
    if (user && !user.hasPaid) navigate("/#precos");
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleGenerateQR = async () => {
    setIsLoadingQR(true);
    setQrCode(null);
    try {
      const response = await fetch(`${backendUrl}/api/whatsapp/qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });
      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
      }
    } catch (error) { console.error(error); } finally { setIsLoadingQR(false); }
  };

  const handleDisconnectWhatsApp = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch(`${backendUrl}/api/whatsapp/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });
      if (response.ok) {
        setIsWhatsAppConnected(false);
        setQrCode(null);
        setShowConfirmDisconnect(false);
      }
    } catch (error) { console.error("Erro ao desconectar:", error); } finally { setIsDisconnecting(false); }
  };

  const handleToggleAI = async (checked: boolean) => {
    setIsAIEnabled(checked);
    setIsSavingAI(true);
    try {
      await fetch(`${backendUrl}/api/settings/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, aiEnabled: checked }),
      });
    } catch (error) { setIsAIEnabled(!checked); } finally { setIsSavingAI(false); }
  };

  const updateDayField = (day: string, field: string, value: any) => {
    setWorkingHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const copyToAllDays = () => {
    const currentConfig = workingHours[selectedDay];
    const newSchedule = DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: { ...currentConfig } }), {});
    setWorkingHours(newSchedule);
  };

  const handleSaveHours = async () => {
    setIsSavingHours(true);
    try {
      await fetch(`${backendUrl}/api/settings/hours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, workingHours, serviceDuration }),
      });
      setShowHoursSuccess(true);
      setTimeout(() => setShowHoursSuccess(false), 3000);
    } catch (error) { console.error(error); } finally { setIsSavingHours(false); }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await fetch(`${backendUrl}/api/settings/store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, storeName }),
      });
      setShowSettingsSuccess(true);
      setTimeout(() => setShowSettingsSuccess(false), 3000);
    } catch (error) { console.error(error); } finally { setIsSavingSettings(false); }
  };

  // Função para reconectar Google caso falhe a sincronização automática
  const handleReconnectGoogle = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/google/url?email=${user?.email}`);
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      console.error("Erro ao redirecionar para Google", err);
    }
  };

  if (!user || !user.hasPaid) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="WBOT Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-lg text-emerald-600">WBOT</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || isDesktop) && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="fixed top-0 left-0 h-screen w-72 bg-white border-r z-40 flex flex-col">
            <div className="p-6 border-b">
              <div className="flex items-center gap-3 mb-1">
                <img src="/logo.png" alt="WBOT Logo" className="w-10 h-10 object-contain" />
                <h1 className="font-bold text-2xl text-emerald-600">WBOT</h1>
              </div>
              <p className="text-xs text-gray-500">Painel de Controle</p>
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Visão Geral" active={activeSection === "overview"} onClick={() => { setActiveSection("overview"); setIsSidebarOpen(false); }} />
              <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Analytics" active={activeSection === "analytics"} onClick={() => { setActiveSection("analytics"); setIsSidebarOpen(false); }} />
              <NavItem icon={<Clock className="w-5 h-5" />} label="Horários" active={activeSection === "hours"} onClick={() => { setActiveSection("hours"); setIsSidebarOpen(false); }} />
              <NavItem icon={<Settings className="w-5 h-5" />} label="Configurações" active={activeSection === "settings"} onClick={() => { setActiveSection("settings"); setIsSidebarOpen(false); }} />
            </nav>
            <div className="p-4 border-t space-y-3">
              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                <p className="font-bold truncate">{storeName || "Minha Loja"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Desconectar WBOT
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="lg:ml-72 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Olá, {storeName ? storeName.split(' ')[0] : 'Admin'}! 👋</h2>
              <p className="text-gray-600 mt-1">Gerencie sua automação de agendamentos</p>
            </div>
            {/* Status do Google na Header do Dashboard */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${isGoogleConnected ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {isGoogleConnected ? <><CheckCircle2 className="w-4 h-4" /> Agenda Google Conectada</> : <><AlertTriangle className="w-4 h-4" /> Agenda Desconectada</>}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeSection === "overview" && (
              <>
                <div className="lg:col-span-2">
                  <Card className="shadow-sm">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Phone className="text-emerald-500 w-5 h-5" /> Conexão WhatsApp</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center py-6">
                      <div className="w-60 h-60 border-2 border-dashed rounded-2xl flex items-center justify-center bg-white shadow-inner overflow-hidden relative border-emerald-100">
                        {isLoadingQR ? <Loader2 className="animate-spin text-emerald-500" /> : 
                         isWhatsAppConnected ? <div className="text-center"><Check className="text-emerald-500 w-12 h-12 mx-auto" /><span className="text-emerald-600 font-bold">Conectado</span></div> :
                         qrCode ? <img src={qrCode} className="w-full h-full p-2" /> : <QrCode className="text-gray-300 w-20 h-20" />}
                      </div>
                      
                      <div className="mt-6 w-full max-w-sm">
                        <AnimatePresence mode="wait">
                          {!showConfirmDisconnect ? (
                            <motion.div key="normal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-3">
                              <Button onClick={handleGenerateQR} disabled={isLoadingQR || isWhatsAppConnected} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Gerar QR</Button>
                              <Button variant="outline" className="text-red-500 border-red-100 hover:bg-red-50" onClick={() => setShowConfirmDisconnect(true)} disabled={!isWhatsAppConnected || isDisconnecting}>
                                Desconectar
                              </Button>
                            </motion.div>
                          ) : (
                            <motion.div key="confirm" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-red-50 border border-red-200 p-3 rounded-xl flex flex-col items-center gap-3">
                              <p className="text-xs font-bold text-red-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Tem certeza que deseja desconectar?</p>
                              <div className="flex gap-2 w-full">
                                <Button size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDisconnectWhatsApp} disabled={isDisconnecting}>
                                  {isDisconnecting ? <Loader2 className="animate-spin w-4 h-4" /> : "Sim, desconectar"}
                                </Button>
                                <Button size="sm" variant="ghost" className="flex-1 text-gray-500" onClick={() => setShowConfirmDisconnect(false)}>Não</Button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Card de IA */}
                  <Card className="shadow-sm">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="text-emerald-600 w-5 h-5" /> IA WBOT</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                      <Switch checked={isAIEnabled} onCheckedChange={handleToggleAI} disabled={isSavingAI} className="data-[state=checked]:bg-emerald-600 scale-125" />
                      <span className="mt-3 font-medium text-sm">{isAIEnabled ? "IA Ativa respondendo" : "IA Pausada"}</span>
                    </CardContent>
                  </Card>

                  {/* Card de Conexão Agenda Google */}
                  <Card className="shadow-sm border-none bg-gradient-to-br from-white to-blue-50/50">
                    <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Calendar className="text-blue-500 w-4 h-4" /> Sincronização Google</CardTitle></CardHeader>
                    <CardContent>
                      {isGoogleConnected ? (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-xs font-bold">Lucy tem acesso total à sua agenda.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500">A Lucy precisa de acesso para agendar horários automaticamente.</p>
                          <Button onClick={handleReconnectGoogle} variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 gap-2 text-xs h-9">
                            <Link2 className="w-3 h-3" /> Conectar Agenda Manualmente
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeSection === "hours" && (
              <motion.div className="lg:col-span-3 space-y-6">
                <Card className="shadow-sm border-none">
                  <CardHeader className="flex flex-row justify-between items-center bg-white border-b rounded-t-xl">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-emerald-600"><Clock /> Agenda por Dia</CardTitle>
                      <CardDescription>Configure os turnos de funcionamento da sua loja.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={copyToAllDays} className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"><Copy className="w-4 h-4" /> Replicar para todos</Button>
                  </CardHeader>

                  <div className="flex overflow-x-auto gap-2 p-4 bg-slate-100/50">
                    {DAYS_OF_WEEK.map(day => (
                      <button key={day} onClick={() => setSelectedDay(day)} className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${selectedDay === day ? "bg-emerald-600 text-white shadow-md" : "bg-white text-gray-500 border border-emerald-100"}`}>
                        {day}
                      </button>
                    ))}
                  </div>

                  <CardContent className="pt-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <TurnoCard title="Manhã" icon={<Sun />} color="amber" active={workingHours[selectedDay]?.isTurno1Active} onToggle={(v) => updateDayField(selectedDay, "isTurno1Active", v)} start={workingHours[selectedDay]?.startTime} end={workingHours[selectedDay]?.endTime} onStart={(v) => updateDayField(selectedDay, "startTime", v)} onEnd={(v) => updateDayField(selectedDay, "endTime", v)} />
                      <TurnoCard title="Tarde" icon={<Coffee />} color="emerald" active={workingHours[selectedDay]?.isTurno2Active} onToggle={(v) => updateDayField(selectedDay, "isTurno2Active", v)} start={workingHours[selectedDay]?.startTime2} end={workingHours[selectedDay]?.endTime2} onStart={(v) => updateDayField(selectedDay, "startTime2", v)} onEnd={(v) => updateDayField(selectedDay, "endTime2", v)} />
                      <TurnoCard title="Noite" icon={<Moon />} color="indigo" active={workingHours[selectedDay]?.isTurno3Active} onToggle={(v) => updateDayField(selectedDay, "isTurno3Active", v)} start={workingHours[selectedDay]?.startTime3} end={workingHours[selectedDay]?.endTime3} onStart={(v) => updateDayField(selectedDay, "startTime3", v)} onEnd={(v) => updateDayField(selectedDay, "endTime3", v)} />
                    </div>

                    <div className="pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-emerald-50">
                        <Label className="text-sm font-bold text-gray-600">Duração do Serviço:</Label>
                        <Input type="number" value={serviceDuration} onChange={(e) => setServiceDuration(Number(e.target.value))} className="w-20 bg-white border-emerald-100" />
                        <span className="text-xs text-gray-400">min</span>
                      </div>
                      <div className="w-full md:w-auto">
                        <Button onClick={handleSaveHours} disabled={isSavingHours} className="w-full md:w-72 bg-emerald-600 hover:bg-emerald-700 h-12 font-bold text-white shadow-lg">
                          {isSavingHours ? <Loader2 className="animate-spin" /> : "Salvar Configurações de Agenda"}
                        </Button>
                        {showHoursSuccess && <p className="text-center text-emerald-600 text-xs mt-2 font-bold">Agenda atualizada com sucesso!</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === "analytics" && (
              <>
                <AnalyticsCard icon={<MessageSquare className="text-emerald-500" />} title="Mensagens WBOT" value={messagesAnswered} color="border-l-emerald-500" />
                <AnalyticsCard icon={<CalendarCheck className="text-emerald-600" />} title="Agendamentos" value={appointmentsMade} color="border-l-emerald-600" />
                <AnalyticsCard icon={<Zap className="text-emerald-400" />} title="Tempo Ganho" value={`${(appointmentsMade * 5)}m`} color="border-l-emerald-400" />
              </>
            )}

            {activeSection === "settings" && (
              <motion.div className="lg:col-span-3">
                <Card className="shadow-sm">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="text-emerald-600" /> Perfil da Loja</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome Comercial (Como a IA se apresenta)</Label>
                      <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Ex: Salão da WBOT" className="border-emerald-100" />
                    </div>
                    <Button onClick={handleSaveSettings} disabled={isSavingSettings} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                      {isSavingSettings ? <Loader2 className="animate-spin" /> : "Salvar Alterações de Perfil"}
                    </Button>
                    {showSettingsSuccess && <p className="text-emerald-600 text-xs font-bold mt-2">Perfil atualizado!</p>}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componentes Auxiliares
function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? "bg-emerald-50 text-emerald-600 font-semibold shadow-sm" : "text-gray-700 hover:bg-emerald-50/50"}`}>
      <span className={active ? "text-emerald-600" : "text-gray-400"}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function TurnoCard({ title, icon, color, active, onToggle, start, end, onStart, onEnd }: any) {
  const colors: any = { 
    amber: "bg-amber-50 border-amber-200 text-amber-700", 
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700", 
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700" 
  };
  return (
    <div className={`p-4 rounded-xl border-2 transition-all ${active ? colors[color] : "bg-gray-50 border-transparent opacity-40"}`}>
      <div className="flex items-center justify-between mb-4">
        <Label className="flex items-center gap-2 font-bold">{icon} {title}</Label>
        <Switch checked={active} onCheckedChange={onToggle} className="data-[state=checked]:bg-emerald-600" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input type="time" value={start} onChange={(e) => onStart(e.target.value)} disabled={!active} className="bg-white border-emerald-50 text-xs" />
        <Input type="time" value={end} onChange={(e) => onEnd(e.target.value)} disabled={!active} className="bg-white border-emerald-50 text-xs" />
      </div>
    </div>
  );
}

function AnalyticsCard({ icon, title, value, color }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`shadow-sm border-l-4 ${color}`}>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg font-medium text-gray-600">{icon} {title}</CardTitle></CardHeader>
        <CardContent><p className="text-4xl font-bold text-gray-900">{value}</p></CardContent>
      </Card>
    </motion.div>
  );
}
