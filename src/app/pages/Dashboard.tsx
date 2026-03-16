import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar,
  LayoutDashboard,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  QrCode,
  Bot,
  RefreshCw,
  Phone,
  CheckCircle2,
  BarChart3,
  MessageSquare,
  CalendarCheck,
  Zap,
  Loader2,
  Check,
  Timer,
  Coffee,
  Moon,
  Sun
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

export function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  
  // Estados de controle do Backend
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [isWhatsAppConnected, setIsWhatsAppConnected] = useState(false);

  // Estados de Feedback Visual
  const [showHoursSuccess, setShowHoursSuccess] = useState(false);
  const [showSettingsSuccess, setShowSettingsSuccess] = useState(false);

  // Estados de Horários (Três Turnos com Ativação)
  const [isTurno1Active, setIsTurno1Active] = useState(true);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");

  const [isTurno2Active, setIsTurno2Active] = useState(true);
  const [startTime2, setStartTime2] = useState("14:00");
  const [endTime2, setEndTime2] = useState("18:00");

  const [isTurno3Active, setIsTurno3Active] = useState(false);
  const [startTime3, setStartTime3] = useState("19:00");
  const [endTime3, setEndTime3] = useState("22:00");
  
  const [activeDays, setActiveDays] = useState<string[]>([]);
  const [serviceDuration, setServiceDuration] = useState<number>(30);
  const [storeName, setStoreName] = useState("");

  // Estados das Métricas Analíticas
  const [messagesAnswered, setMessagesAnswered] = useState(0);
  const [appointmentsMade, setAppointmentsMade] = useState(0);
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const daysOfWeek = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
  const durationOptions = [
    { value: 15, label: "15 min" }, { value: 30, label: "30 min" },
    { value: 45, label: "45 min" }, { value: 60, label: "1 hora" },
    { value: 90, label: "1:30h" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.email) return;
      try {
        const response = await fetch(`${backendUrl}/api/user/profile?email=${user.email}`);
        if (response.ok) {
          const data = await response.json();
          setStoreName(data.store_name || "");
          setIsAIEnabled(data.is_ai_enabled ?? true);
          
          // Carregamento dos Turnos
          setStartTime(data.start_time || "08:00");
          setEndTime(data.end_time || "12:00");
          setIsTurno1Active(data.is_turno1_active ?? true);

          setStartTime2(data.start_time_2 || "14:00");
          setEndTime2(data.end_time_2 || "18:00");
          setIsTurno2Active(data.is_turno2_active ?? true);

          setStartTime3(data.start_time_3 || "19:00");
          setEndTime3(data.end_time_3 || "22:00");
          setIsTurno3Active(data.is_turno3_active ?? false);

          setIsWhatsAppConnected(!!data.whatsapp_session); 
          
          if (data.active_days) {
            setActiveDays(JSON.parse(data.active_days));
          } else {
            setActiveDays(["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira"]);
          }
          setServiceDuration(data.service_duration || 30);
          setMessagesAnswered(data.messages_answered || 0);
          setAppointmentsMade(data.appointments_made || 0);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      }
    };

    if (user && user.hasPaid) fetchUserData();
  }, [user, backendUrl]);

  useEffect(() => {
    if (user) {
      if (!user.hasPaid) navigate("/#precos"); 
    } else {
      navigate("/login");
    }
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
    } catch (error) {
      console.error("Erro na conexão:", error);
    } finally {
      setIsLoadingQR(false);
    }
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
    } catch (error) {
      setIsAIEnabled(!checked);
    } finally {
      setIsSavingAI(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/whatsapp/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });
      if (response.ok) {
        setQrCode(null);
        setIsWhatsAppConnected(false);
      }
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    }
  };

  const handleSaveHours = async () => {
    setIsSavingHours(true);
    try {
      await fetch(`${backendUrl}/api/settings/hours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          startTime, endTime, isTurno1Active,
          startTime2, endTime2, isTurno2Active,
          startTime3, endTime3, isTurno3Active,
          activeDays: JSON.stringify(activeDays),
          serviceDuration
        }),
      });
      setShowHoursSuccess(true);
      setTimeout(() => setShowHoursSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSavingHours(false);
    }
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
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const toggleDay = (day: string) => {
    setActiveDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const calculateSavedTime = (appointments: number) => {
    const totalMinutes = appointments * 5;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`;
  };

  if (!user || !user.hasPaid) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="WAG BOT" className="w-8 h-8" />
          <span className="font-bold text-lg bg-gradient-to-r from-[#007BFF] to-[#6F42C1] bg-clip-text text-transparent">WAG BOT</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || isDesktop) && (
          <motion.aside
            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 shadow-sm z-40 flex flex-col"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="WAG BOT" className="w-10 h-10" />
                <div>
                  <h1 className="font-bold text-xl bg-gradient-to-r from-[#007BFF] to-[#6F42C1] bg-clip-text text-transparent">WAG BOT</h1>
                  <p className="text-xs text-gray-500">Painel de Controle</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Visão Geral" active={activeSection === "overview"} onClick={() => { setActiveSection("overview"); setIsSidebarOpen(false); }} />
              <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Analytics" active={activeSection === "analytics"} onClick={() => { setActiveSection("analytics"); setIsSidebarOpen(false); }} />
              <NavItem icon={<Clock className="w-5 h-5" />} label="Horários" active={activeSection === "hours"} onClick={() => { setActiveSection("hours"); setIsSidebarOpen(false); }} />
              <NavItem icon={<Settings className="w-5 h-5" />} label="Configurações" active={activeSection === "settings"} onClick={() => { setActiveSection("settings"); setIsSidebarOpen(false); }} />
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-3">
              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                <p className="text-xs text-gray-500 mb-1">Loja de:</p>
                <p className="font-bold text-gray-900 truncate">{storeName || "Minha Loja"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Desconectar
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="lg:ml-72 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-bold text-gray-900">Olá, {storeName ? storeName.split(' ')[0] : 'Admin'}! 👋</h2>
            <p className="text-gray-600 mt-1">Gerencie sua automação de agendamentos</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeSection === "overview" && (
              <>
                <motion.div className="lg:col-span-2">
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className={`w-5 h-5 ${isWhatsAppConnected ? "text-[#25D366]" : "text-gray-400"}`} /> Status da Conexão
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-center py-6">
                        <div className="w-60 h-60 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-white shadow-inner overflow-hidden relative">
                          {isLoadingQR ? <Loader2 className="w-10 h-10 text-gray-400 animate-spin" /> : 
                           isWhatsAppConnected ? (
                            <div className="flex flex-col items-center gap-2 animate-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"><Check className="w-8 h-8 text-green-600" /></div>
                                <span className="font-bold text-green-600">Conectado com sucesso ✔</span>
                            </div>
                          ) : qrCode ? <img src={qrCode} alt="QR Code" className="w-full h-full object-cover p-2" /> : <QrCode className="w-24 h-24 text-gray-300" />}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button onClick={handleGenerateQR} disabled={isLoadingQR || isWhatsAppConnected} className="bg-[#25D366] hover:bg-[#1fb855] text-white">
                          <RefreshCw className="w-4 h-4 mr-2" /> Gerar Novo QR Code
                        </Button>
                        <Button onClick={handleDisconnectWhatsApp} variant="outline" className="text-red-600 border-red-200">
                          <LogOut className="w-4 h-4 mr-2" /> Sair do WhatsApp
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div>
                  <Card className="shadow-sm h-full">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5 text-[#6F42C1]" /> IA Automática</CardTitle></CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Switch checked={isAIEnabled} onCheckedChange={handleToggleAI} disabled={isSavingAI} className="scale-150" />
                      <div className="mt-6 text-sm font-medium">{isAIEnabled ? "Atendimento Ativado" : "Atendimento Pausado"}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}

            {activeSection === "hours" && (
              <motion.div className="lg:col-span-3">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-[#007BFF]" /> Configurar Atendimento</CardTitle>
                    <CardDescription>Defina os turnos e a duração dos seus serviços. O bot respeitará apenas os turnos ligados.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {/* Dias da Semana */}
                    <div className="space-y-3">
                      <Label className="text-gray-700 font-semibold text-sm">Dias de Atendimento:</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                        {daysOfWeek.map((day) => (
                          <button key={day} onClick={() => toggleDay(day)} className={`px-3 py-2.5 rounded-lg text-xs font-medium border-2 transition-all ${activeDays.includes(day) ? "bg-[#007BFF] border-[#007BFF] text-white" : "bg-white border-gray-200 text-gray-600 hover:border-blue-200"}`}>
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t">
                      {/* Primeiro Turno */}
                      <div className={`p-4 rounded-xl border-2 transition-all ${isTurno1Active ? "bg-blue-50/50 border-blue-100" : "bg-gray-50 border-gray-100 opacity-60"}`}>
                        <div className="flex items-center justify-between mb-4">
                          <Label className="flex items-center gap-2 text-blue-700 font-bold text-sm"><Sun className="w-4 h-4" /> 1º Turno</Label>
                          <Switch checked={isTurno1Active} onCheckedChange={setIsTurno1Active} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Início</span>
                            <Input type="time" disabled={!isTurno1Active} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Fim</span>
                            <Input type="time" disabled={!isTurno1Active} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                          </div>
                        </div>
                      </div>

                      {/* Segundo Turno */}
                      <div className={`p-4 rounded-xl border-2 transition-all ${isTurno2Active ? "bg-purple-50/50 border-purple-100" : "bg-gray-50 border-gray-100 opacity-60"}`}>
                        <div className="flex items-center justify-between mb-4">
                          <Label className="flex items-center gap-2 text-purple-700 font-bold text-sm"><Coffee className="w-4 h-4" /> 2º Turno</Label>
                          <Switch checked={isTurno2Active} onCheckedChange={setIsTurno2Active} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Início</span>
                            <Input type="time" disabled={!isTurno2Active} value={startTime2} onChange={(e) => setStartTime2(e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Fim</span>
                            <Input type="time" disabled={!isTurno2Active} value={endTime2} onChange={(e) => setEndTime2(e.target.value)} />
                          </div>
                        </div>
                      </div>

                      {/* Terceiro Turno */}
                      <div className={`p-4 rounded-xl border-2 transition-all ${isTurno3Active ? "bg-indigo-50/50 border-indigo-100" : "bg-gray-50 border-gray-100 opacity-60"}`}>
                        <div className="flex items-center justify-between mb-4">
                          <Label className="flex items-center gap-2 text-indigo-700 font-bold text-sm"><Moon className="w-4 h-4" /> 3º Turno</Label>
                          <Switch checked={isTurno3Active} onCheckedChange={setIsTurno3Active} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Início</span>
                            <Input type="time" disabled={!isTurno3Active} value={startTime3} onChange={(e) => setStartTime3(e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Fim</span>
                            <Input type="time" disabled={!isTurno3Active} value={endTime3} onChange={(e) => setEndTime3(e.target.value)} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Duração e Botão Salvar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t items-end">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Timer className="w-4 h-4 text-gray-500" /> Duração de cada Atendimento:</Label>
                        <select className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={serviceDuration} onChange={(e) => setServiceDuration(Number(e.target.value))}>
                          {durationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col items-end">
                        <Button onClick={handleSaveHours} disabled={isSavingHours} className="w-full bg-[#007BFF] hover:bg-blue-600 h-11">
                          {isSavingHours ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Configurações de Horários"}
                        </Button>
                        {showHoursSuccess && <p className="text-green-600 text-xs font-medium mt-2 flex items-center gap-1 animate-in slide-in-from-top-1"><Check className="w-3 h-3" /> Configurações salvas no banco!</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === "settings" && (
              <motion.div className="lg:col-span-3">
                <Card className="shadow-sm">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-[#6F42C1]" /> Configurações Gerais</CardTitle></CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>Nome da Loja</Label>
                      <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Ex: Salão da Lucy" />
                    </div>
                    <Button onClick={handleSaveSettings} disabled={isSavingSettings} className="w-full bg-gradient-to-r from-[#007BFF] to-[#6F42C1] text-white">
                      {isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Nome da Loja"}
                    </Button>
                    {showSettingsSuccess && <p className="text-green-600 text-xs font-medium mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> Nome atualizado!</p>}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === "analytics" && (
              <>
                <AnalyticsCard icon={<MessageSquare className="text-blue-500" />} title="Mensagens Hoje" value={messagesAnswered} color="border-l-blue-500" />
                <AnalyticsCard icon={<CalendarCheck className="text-purple-500" />} title="Agendamentos" value={appointmentsMade} color="border-l-purple-500" />
                <AnalyticsCard icon={<Zap className="text-emerald-500" />} title="Tempo Economizado" value={calculateSavedTime(appointmentsMade)} color="border-l-emerald-500" />
              </>
            )}
          </div>

          <footer className="text-center py-8 border-t border-gray-200 mt-12 text-gray-400 text-[10px] tracking-widest uppercase flex items-center justify-center gap-3">
            Desenvolvido por <a href="https://korvenlab.vercel.app/" target="_blank"><img src="/logokorven.png" alt="Korven Lab" className="h-3 opacity-50 hover:opacity-100 transition-opacity" /></a>
          </footer>
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? "bg-blue-50 text-[#007BFF] font-semibold" : "text-gray-700 hover:bg-gray-50"}`}>
      {icon} <span>{label}</span>
    </button>
  );
}

function AnalyticsCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string | number; color: string; }) {
    return (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`shadow-sm border-l-4 ${color}`}>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg">{icon} {title}</CardTitle></CardHeader>
                <CardContent><p className="text-5xl font-bold text-gray-900">{value}</p></CardContent>
            </Card>
        </motion.div>
    );
}
