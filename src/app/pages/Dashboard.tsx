import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, LayoutDashboard, Clock, Settings, LogOut, Menu, X, QrCode,
  Bot, Phone, CheckCircle2, BarChart3, MessageSquare,
  CalendarCheck, Zap, Loader2, Check, Timer, Coffee, Moon, Sun, Copy, AlertTriangle, ChevronRight, Sparkles
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

  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
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

  const [workingHours, setWorkingHours] = useState<Record<string, any>>({});
  const [serviceDuration, setServiceDuration] = useState<number>(30);
  const [storeName, setStoreName] = useState("");
  const [messagesAnswered, setMessagesAnswered] = useState(0);
  const [appointmentsMade, setAppointmentsMade] = useState(0);

  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_API_URL || "https://wag-backend.onrender.com";

  useEffect(() => {
    if (loading || !user || !user.hasPaid) return;

    const fetchUserData = async () => {
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
    
    fetchUserData();
  }, [user, loading, backendUrl]);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate("/login");
      else if (!user.hasPaid) navigate("/#precos");
    }
  }, [user, loading, navigate]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-[#64b34d]" />
      </div>
    );
  }

  if (!user || !user.hasPaid) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Luzes de fundo orgânicas para manter o padrão da Landing Page */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-green-50/50 blur-[120px] rounded-full -z-10" />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Wagoo Logo" className="w-8 h-8 object-contain" />
          <span className="font-black text-xl text-slate-900 tracking-tighter">WAGOO</span>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar - Estilo Glassmorphism */}
      <AnimatePresence>
        {(isSidebarOpen || isDesktop) && (
          <motion.aside 
            initial={{ x: -300 }} 
            animate={{ x: 0 }} 
            exit={{ x: -300 }} 
            className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-slate-100 z-40 flex flex-col shadow-2xl lg:shadow-none"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-2">
                <img src="/logo.png" alt="Wagoo" className="w-10 h-10 object-contain" />
                <h1 className="font-black text-2xl text-slate-900 tracking-tighter uppercase">Wagoo</h1>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-[#4d8f3b] text-[10px] font-black tracking-widest uppercase">
                <Sparkles size={10} /> Dashboard Pro
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
              <NavItem icon={<LayoutDashboard size={20} />} label="Visão Geral" active={activeSection === "overview"} onClick={() => { setActiveSection("overview"); setIsSidebarOpen(false); }} />
              <NavItem icon={<BarChart3 size={20} />} label="Analytics" active={activeSection === "analytics"} onClick={() => { setActiveSection("analytics"); setIsSidebarOpen(false); }} />
              <NavItem icon={<Clock size={20} />} label="Horários da Agenda" active={activeSection === "hours"} onClick={() => { setActiveSection("hours"); setIsSidebarOpen(false); }} />
              <NavItem icon={<Settings size={20} />} label="Configurações" active={activeSection === "settings"} onClick={() => { setActiveSection("settings"); setIsSidebarOpen(false); }} />
            </nav>

            <div className="p-6 mt-auto">
              <div className="bg-slate-50 rounded-3xl p-4 mb-4 border border-slate-100">
                <p className="font-black text-slate-900 text-sm truncate">{storeName || "Minha Loja"}</p>
                <p className="text-xs text-slate-400 font-medium truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-red-500 font-bold text-sm hover:bg-red-50 transition-colors">
                <LogOut size={16} /> Sair da conta
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="lg:ml-72 pt-24 lg:pt-0 p-6 lg:p-12">
        <div className="max-w-6xl mx-auto space-y-10">
          
          {/* Header de Boas Vindas */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none">
                Olá, {storeName ? storeName.split(' ')[0] : 'Admin'}! 👋
              </h2>
              <p className="text-slate-500 font-medium text-lg">Sua assistente está pronta para agendar.</p>
            </div>
            
            {isGoogleConnected && (
              <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm text-emerald-600 text-sm font-bold">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Google Calendar Sincronizado
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {activeSection === "overview" && (
              <>
                <div className="lg:col-span-2 space-y-8">
                  {/* Card WhatsApp Premium */}
                  <Card className="rounded-[40px] border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden bg-white">
                    <CardHeader className="pb-2 pt-8 px-8">
                       <CardTitle className="text-xl font-black flex items-center gap-3 tracking-tight">
                         <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-[#64b34d]">
                            <Phone size={20} fill="currentColor" />
                         </div>
                         Conexão WhatsApp
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 flex flex-col md:flex-row items-center gap-10">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-600 rounded-[36px] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative w-56 h-56 bg-white border border-slate-100 rounded-[32px] flex items-center justify-center shadow-inner overflow-hidden">
                          {isLoadingQR ? <Loader2 className="animate-spin text-[#64b34d] w-8 h-8" /> : 
                           isWhatsAppConnected ? (
                             <div className="text-center space-y-2">
                               <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                                  <Check className="text-[#64b34d] w-8 h-8" strokeWidth={3} />
                               </div>
                               <span className="text-[#64b34d] font-black text-sm uppercase tracking-widest">Ativo</span>
                             </div>
                           ) :
                           qrCode ? <img src={qrCode} className="w-full h-full p-4" /> : <QrCode className="text-slate-200 w-16 h-16" />}
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-6 text-center md:text-left">
                        <div className="space-y-2">
                          <h4 className="font-black text-slate-900 text-lg">Status da Conexão</h4>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            {isWhatsAppConnected 
                              ? "Tudo pronto! Seu Wagoo está online e respondendo seus clientes em tempo real." 
                              : "Escaneie o QR Code com seu WhatsApp para ativar a automação de agendamentos."}
                          </p>
                        </div>
                        
                        <div className="w-full">
                          <AnimatePresence mode="wait">
                            {!showConfirmDisconnect ? (
                              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                <Button 
                                  onClick={handleGenerateQR} 
                                  disabled={isLoadingQR || isWhatsAppConnected} 
                                  className="rounded-2xl h-12 px-8 bg-slate-900 text-white font-bold hover:bg-[#64b34d] transition-all"
                                >
                                  Gerar Novo QR
                                </Button>
                                {isWhatsAppConnected && (
                                  <Button 
                                    variant="outline" 
                                    className="rounded-2xl h-12 px-6 border-red-100 text-red-500 font-bold hover:bg-red-50" 
                                    onClick={() => setShowConfirmDisconnect(true)}
                                  >
                                    Desconectar
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-red-50 p-5 rounded-[24px] border border-red-100 space-y-4">
                                <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                                  <AlertTriangle size={18} /> Confirmar desconexão?
                                </p>
                                <div className="flex gap-2">
                                  <Button size="sm" className="bg-red-600 text-white rounded-xl font-bold px-4" onClick={handleDisconnectWhatsApp} disabled={isDisconnecting}>
                                    {isDisconnecting ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirmar"}
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-slate-500 font-bold" onClick={() => setShowConfirmDisconnect(false)}>Cancelar</Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-8">
                  {/* Card IA */}
                  <Card className="rounded-[40px] border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] bg-white p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 rounded-[20px] bg-slate-900 flex items-center justify-center text-white">
                        <Bot size={24} />
                      </div>
                      <Switch 
                        checked={isAIEnabled} 
                        onCheckedChange={handleToggleAI} 
                        disabled={isSavingAI} 
                        className="data-[state=checked]:bg-[#64b34d]" 
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-xl text-slate-900 tracking-tight">Cérebro da IA</h3>
                      <p className="text-slate-500 text-sm font-medium">
                        {isAIEnabled ? "Ativa e agendando clientes." : "IA pausada no momento."}
                      </p>
                    </div>
                  </Card>

                  {/* Card Sincronização */}
                  <div className="bg-gradient-to-br from-[#64b34d] to-[#4d8f3b] p-8 rounded-[40px] text-white shadow-xl shadow-green-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Calendar size={20} />
                      </div>
                      <span className="font-black text-sm uppercase tracking-widest">Sincronizado</span>
                    </div>
                    <p className="text-lg font-bold leading-tight">Lucy já sincronizou seus eventos automaticamente.</p>
                  </div>
                </div>
              </>
            )}

            {activeSection === "hours" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
                <Card className="rounded-[48px] border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] bg-white overflow-hidden">
                  <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-1">
                      <CardTitle className="text-3xl font-black text-slate-900 tracking-tighter">Horários da Agenda</CardTitle>
                      <CardDescription className="text-slate-500 font-medium text-base">Defina quando sua loja está aberta para novos agendamentos.</CardDescription>
                    </div>
                    <Button variant="outline" onClick={copyToAllDays} className="rounded-2xl border-slate-100 text-slate-600 font-bold hover:bg-slate-50 gap-2">
                      <Copy size={16} /> Replicar para a semana
                    </Button>
                  </div>

                  <div className="bg-slate-50/50 p-4 flex overflow-x-auto gap-2 no-scrollbar">
                    {DAYS_OF_WEEK.map(day => (
                      <button 
                        key={day} 
                        onClick={() => setSelectedDay(day)} 
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                          selectedDay === day ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  <CardContent className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <TurnoCard title="Manhã" icon={<Sun size={20} />} active={workingHours[selectedDay]?.isTurno1Active} onToggle={(v: boolean) => updateDayField(selectedDay, "isTurno1Active", v)} start={workingHours[selectedDay]?.startTime} end={workingHours[selectedDay]?.endTime} onStart={(v: string) => updateDayField(selectedDay, "startTime", v)} onEnd={(v: string) => updateDayField(selectedDay, "endTime", v)} />
                      <TurnoCard title="Tarde" icon={<Coffee size={20} />} active={workingHours[selectedDay]?.isTurno2Active} onToggle={(v: boolean) => updateDayField(selectedDay, "isTurno2Active", v)} start={workingHours[selectedDay]?.startTime2} end={workingHours[selectedDay]?.endTime2} onStart={(v: string) => updateDayField(selectedDay, "startTime2", v)} onEnd={(v: string) => updateDayField(selectedDay, "endTime2", v)} />
                      <TurnoCard title="Noite" icon={<Moon size={20} />} active={workingHours[selectedDay]?.isTurno3Active} onToggle={(v: boolean) => updateDayField(selectedDay, "isTurno3Active", v)} start={workingHours[selectedDay]?.startTime3} end={workingHours[selectedDay]?.endTime3} onStart={(v: string) => updateDayField(selectedDay, "startTime3", v)} onEnd={(v: string) => updateDayField(selectedDay, "endTime3", v)} />
                    </div>

                    <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[28px] border border-slate-100">
                        <Label className="text-sm font-black text-slate-900 uppercase tracking-tight">Duração do Serviço:</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" value={serviceDuration} onChange={(e) => setServiceDuration(Number(e.target.value))} className="w-20 bg-white border-none rounded-xl font-bold shadow-sm h-10" />
                          <span className="text-xs font-black text-slate-400 uppercase">Minutos</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Button 
                          onClick={handleSaveHours} 
                          disabled={isSavingHours} 
                          className="w-full md:w-72 h-16 rounded-[24px] bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black text-lg shadow-xl shadow-green-100"
                        >
                          {isSavingHours ? <Loader2 className="animate-spin" /> : "Salvar Agenda"}
                        </Button>
                        {showHoursSuccess && (
                          <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -bottom-8 left-0 right-0 text-center text-emerald-600 text-xs font-black uppercase tracking-widest">
                            ✓ Salvo com sucesso
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === "analytics" && (
              <>
                <AnalyticsCard icon={<MessageSquare className="text-emerald-500" />} title="Mensagens Trocadas" value={messagesAnswered} />
                <AnalyticsCard icon={<CalendarCheck className="text-emerald-600" />} title="Agendamentos Feitos" value={appointmentsMade} />
                <AnalyticsCard icon={<Zap className="text-amber-500" />} title="Horas Recuperadas" value={`${(appointmentsMade * 5 / 60).toFixed(1)}h`} />
              </>
            )}

            {activeSection === "settings" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3">
                <Card className="rounded-[48px] border-none shadow-2xl bg-white p-10">
                  <div className="mb-10">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Perfil da Loja</h3>
                    <p className="text-slate-500 font-medium">Como sua assistente se apresenta aos clientes.</p>
                  </div>
                  <div className="space-y-8 max-w-2xl">
                    <div className="space-y-3">
                      <Label className="text-sm font-black text-slate-900 uppercase tracking-widest">Nome do Estabelecimento</Label>
                      <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Ex: Salão da Wagoo" className="h-14 px-6 rounded-2xl bg-slate-50 border-none text-lg font-medium" />
                    </div>
                    <Button onClick={handleSaveSettings} disabled={isSavingSettings} className="w-full md:w-64 h-14 rounded-2xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800">
                      {isSavingSettings ? <Loader2 className="animate-spin" /> : "Atualizar Perfil"}
                    </Button>
                    {showSettingsSuccess && <p className="text-emerald-600 text-sm font-black uppercase tracking-widest mt-2">Perfil atualizado com sucesso!</p>}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all group ${
      active ? "bg-white text-slate-900 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50/50"
    }`}>
      <div className="flex items-center gap-4">
        <span className={`${active ? "text-[#64b34d]" : "text-slate-300 group-hover:text-slate-400"}`}>{icon}</span>
        <span className="text-sm font-black tracking-tight">{label}</span>
      </div>
      {active && <ChevronRight size={14} className="text-slate-300" />}
    </button>
  );
}

function TurnoCard({ title, icon, active, onToggle, start, end, onStart, onEnd }: any) {
  return (
    <div className={`p-8 rounded-[32px] border-2 transition-all duration-300 ${
      active ? "bg-white border-[#64b34d] shadow-[0_20px_40px_-10px_rgba(100,179,77,0.1)]" : "bg-slate-50/50 border-transparent opacity-60"
    }`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-green-50 text-[#64b34d]" : "bg-slate-100 text-slate-400"}`}>
            {icon}
          </div>
          <span className="font-black text-slate-900 text-lg tracking-tight">{title}</span>
        </div>
        <Switch checked={active} onCheckedChange={onToggle} className="data-[state=checked]:bg-[#64b34d]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Início</Label>
          <Input type="time" value={start} onChange={(e) => onStart(e.target.value)} disabled={!active} className="h-12 bg-slate-50 border-none rounded-xl font-bold text-center" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fim</Label>
          <Input type="time" value={end} onChange={(e) => onEnd(e.target.value)} disabled={!active} className="h-12 bg-slate-50 border-none rounded-xl font-bold text-center" />
        </div>
      </div>
    </div>
  );
}

function AnalyticsCard({ icon, title, value }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="rounded-[40px] border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] bg-white p-8 h-full flex flex-col justify-between">
        <div className="w-12 h-12 rounded-[20px] bg-slate-50 flex items-center justify-center mb-6">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <p className="text-5xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
      </Card>
    </motion.div>
  );
}
