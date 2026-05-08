import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Clock, Settings, LogOut, Menu, X, QrCode,
  Bot, Phone, BarChart3, MessageSquare,
  CalendarCheck, Zap, Loader2, Check, Coffee, Moon, Sun, Copy, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { FeedbackFab } from "../components/FeedbackFab";
import { supabase } from "../lib/supabase";

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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const response = await fetch(`${backendUrl}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStoreName(data.store_name || "");
          setIsAIEnabled(data.is_ai_enabled ?? true);
          setIsWhatsAppConnected(!!data.whatsapp_session);
          setMessagesAnswered(data.messages_answered || 0);
          setAppointmentsMade(data.appointments_made || 0);
          setServiceDuration(data.service_duration || 30);
          setIsGoogleConnected(!!(data.googleAuth && data.googleAuth.refreshToken));

          if (data.working_hours && Object.keys(data.working_hours).length > 0) {
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
        body: JSON.stringify({ email: user?.email, is_ai_enabled: checked }),
      });
    } catch (error) { 
      setIsAIEnabled(!checked); 
    } finally { 
      setIsSavingAI(false); 
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
      const response = await fetch(`${backendUrl}/api/settings/hours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: user?.email, 
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
    setIsSavingSettings(true);
    try {
      const response = await fetch(`${backendUrl}/api/settings/store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, storeName: storeName }),
      });
      if (response.ok) {
        setShowSettingsSuccess(true);
        setTimeout(() => setShowSettingsSuccess(false), 3000);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsSavingSettings(false); 
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-green-50/50 blur-[120px] rounded-full -z-10" />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
        <img src="/logo.png" alt="Wagoo Logo" className="w-10 h-10 object-contain" />
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <AnimatePresence>
        {(isSidebarOpen || isDesktop) && (
          <motion.aside 
            initial={{ x: -300 }} 
            animate={{ x: 0 }} 
            exit={{ x: -300 }} 
            className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-slate-100 z-40 flex flex-col shadow-2xl lg:shadow-none"
          >
            <div className="pt-16 pb-10 flex flex-col items-center justify-center">
              <img src="/logo.png" alt="Wagoo Logo" className="w-32 h-32 object-contain" />
            </div>

            <nav className="flex-1 px-6 space-y-2">
              <NavItem icon={<LayoutDashboard size={20} />} label="Visão Geral" active={activeSection === "overview"} onClick={() => { setActiveSection("overview"); setIsSidebarOpen(false); }} />
              <NavItem icon={<BarChart3 size={20} />} label="Analytics" active={activeSection === "analytics"} onClick={() => { setActiveSection("analytics"); setIsSidebarOpen(false); }} />
              <NavItem icon={<Clock size={20} />} label="Horários" active={activeSection === "hours"} onClick={() => { setActiveSection("hours"); setIsSidebarOpen(false); }} />
              <NavItem icon={<Settings size={20} />} label="Configurações" active={activeSection === "settings"} onClick={() => { setActiveSection("settings"); setIsSidebarOpen(false); }} />
            </nav>

            <div className="p-8 mt-auto">
              <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                <p className="font-bold text-slate-900 text-sm truncate">{storeName || "Minha Loja"}</p>
                <p className="text-xs text-slate-400 font-medium truncate">{user?.email}</p>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 font-bold text-sm hover:bg-red-50 transition-colors">
                <LogOut size={16} /> Sair
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="lg:ml-72 p-6 lg:p-10">
        <div className="max-w-5xl mx-auto">
          
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-20 lg:mt-32 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Olá, {storeName ? storeName.split(' ')[0] : 'Admin'}
              </h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">Sua assistente está pronta para agendar.</p>
            </div>
            
            {isGoogleConnected && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm text-emerald-600 text-[10px] font-black uppercase tracking-[0.1em]">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Google Calendar Sincronizado
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeSection === "overview" && (
              <>
                <div className="lg:col-span-2">
                  <Card className="rounded-[32px] border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
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
                         qrCode ? <img src={qrCode} className="w-full h-full p-3" alt="QR Code" /> : <QrCode className="text-slate-100 w-12 h-12" />}
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
                  <Card className="rounded-[32px] border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.04)] bg-white p-7">
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
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

            {activeSection === "hours" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3">
                <Card className="rounded-[40px] border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] bg-white">
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
                          selectedDay === day ? "bg-slate-900 text-white shadow-xl" : "bg-white text-slate-400 border border-slate-100"
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
                        <Button onClick={handleSaveHours} disabled={isSavingHours} className="w-full md:w-64 h-14 rounded-2xl bg-[#64b34d] hover:bg-[#4d8f3b] text-white font-black text-base shadow-2xl shadow-green-100/50 transition-all">
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
              </>
            )}

            {activeSection === "settings" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-3">
                <Card className="rounded-[40px] border-none shadow-2xl bg-white p-10">
                  <div className="mb-10">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Configurações do Perfil</h3>
                    <p className="text-slate-500 font-medium mt-1 text-base leading-relaxed">Personalize o nome da sua loja no sistema para a IA se apresentar.</p>
                  </div>
                  <div className="space-y-8 max-w-lg">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nome de Exibição</Label>
                      <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="h-14 px-6 rounded-2xl bg-slate-50 border-none font-bold text-lg focus-visible:ring-1 focus-visible:ring-[#64b34d]" />
                    </div>
                    <Button onClick={handleSaveSettings} disabled={isSavingSettings} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-base transition-all hover:bg-slate-800">
                      {isSavingSettings ? <Loader2 className="animate-spin" /> : "Salvar Alterações"}
                    </Button>
                    {showSettingsSuccess && <p className="text-emerald-600 text-xs font-black text-center uppercase tracking-widest">✓ Perfil Atualizado</p>}
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

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${
      active ? "bg-slate-50 text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-700 hover:bg-slate-50/50"
    }`}>
      <div className="flex items-center gap-4">
        <span className={active ? "text-[#64b34d]" : "text-slate-300"}>{icon}</span>
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </div>
      {active && <ChevronRight size={14} className="text-slate-300" />}
    </button>
  );
}

function TurnoCard({ title, icon, active, onToggle, start, end, onStart, onEnd }: any) {
  return (
    <div className={`p-8 rounded-[32px] border-2 transition-all duration-300 ${
      active ? "bg-white border-[#64b34d]/20 shadow-lg shadow-green-100/10" : "bg-slate-50/50 border-transparent opacity-60"
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
    <Card className="rounded-[40px] border-none shadow-[0_20px_40px_-10px_rgba(0,0,0,0.03)] bg-white p-8 h-full flex flex-col justify-between transition-all hover:translate-y-[-5px] hover:shadow-xl">
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
