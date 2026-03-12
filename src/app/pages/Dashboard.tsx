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
  Mail,
  Store,
  Loader2
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
  
  // Estados de controle das funcionalidades do Backend
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [isSavingAI, setIsSavingAI] = useState(false);

  // Estados de Configuração da Loja
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [activeDays, setActiveDays] = useState<string[]>([
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
  ]);
  const [serviceDuration, setServiceDuration] = useState<number>(30);
  const [storeName, setStoreName] = useState("");
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // URL do Backend conectada às variáveis de ambiente
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const daysOfWeek = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
    "Domingo",
  ];

  const durationOptions = [
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 45, label: "45 min" },
    { value: 60, label: "1 hora" },
    { value: 90, label: "1:30h" },
  ];

  // PROTEÇÃO DE ROTA: Verifica se o utilizador pagou
  useEffect(() => {
    if (user) {
      if (!user.hasPaid) {
        navigate("/#precos"); 
      }
    } else {
       navigate("/login");
    }
  }, [user, navigate]);

  // Controle de responsividade da Sidebar
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // INTEGRAÇÃO: Solicitar Geração de QR Code
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
      console.error("Erro na conexão com o backend:", error);
    } finally {
      setIsLoadingQR(false);
    }
  };

  // INTEGRAÇÃO: Ligar/Desligar a IA
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
      console.error("Erro ao salvar configuração da IA:", error);
      setIsAIEnabled(!checked); // Reverte caso falhe
    } finally {
      setIsSavingAI(false);
    }
  };

  // INTEGRAÇÃO: Desconectar WhatsApp
  const handleDisconnectWhatsApp = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/whatsapp/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });

      if (response.ok) {
        setQrCode(null);
      }
    } catch (error) {
      console.error("Erro ao tentar desconectar:", error);
    }
  };

  const handleSaveHours = () => {
    console.log("Salvando horários:", { startTime, endTime, activeDays, serviceDuration });
  };

  const handleSaveSettings = () => {
    console.log("Salvando configurações:", { storeName });
  };

  const toggleDay = (day: string) => {
    setActiveDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  if (!user || !user.hasPaid) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="WAG BOT" className="w-8 h-8" />
          <span className="font-bold text-lg bg-gradient-to-r from-[#007BFF] to-[#6F42C1] bg-clip-text text-transparent">
            WAG BOT
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isSidebarOpen || isDesktop) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 shadow-sm z-40 flex flex-col"
          >
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="WAG BOT" className="w-10 h-10" />
                <div>
                  <h1 className="font-bold text-xl bg-gradient-to-r from-[#007BFF] to-[#6F42C1] bg-clip-text text-transparent">
                    WAG BOT
                  </h1>
                  <p className="text-xs text-gray-500">Painel de Controle</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              <NavItem
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Visão Geral"
                active={activeSection === "overview"}
                onClick={() => {
                  setActiveSection("overview");
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon={<BarChart3 className="w-5 h-5" />}
                label="Analytics"
                active={activeSection === "analytics"}
                onClick={() => {
                  setActiveSection("analytics");
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon={<Clock className="w-5 h-5" />}
                label="Horários"
                active={activeSection === "hours"}
                onClick={() => {
                  setActiveSection("hours");
                  setIsSidebarOpen(false);
                }}
              />
              <NavItem
                icon={<Settings className="w-5 h-5" />}
                label="Configurações"
                active={activeSection === "settings"}
                onClick={() => {
                  setActiveSection("settings");
                  setIsSidebarOpen(false);
                }}
              />
            </nav>

            {/* User Info & Logout */}
            <div className="p-4 border-t border-gray-100 space-y-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Conta conectada:</p>
                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Desconectar Conta Google
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:ml-72 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900">Painel de Controle</h2>
            <p className="text-gray-600 mt-1">Gerencie sua automação de agendamentos</p>
          </motion.div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visão Geral - Cards A e B */}
            {activeSection === "overview" && (
              <>
                {/* Card A - WhatsApp Connection */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="lg:col-span-2"
                >
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-[#25D366]" />
                        Status da Conexão
                      </CardTitle>
                      <CardDescription>Conecte seu WhatsApp para começar a automatizar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <h4 className="font-semibold text-sm text-blue-900 mb-3">Como conectar:</h4>
                        <ol className="space-y-2 text-sm text-blue-800">
                          <li className="flex items-start gap-2">
                            <span className="font-bold">1.</span>
                            <span>Abra o WhatsApp no seu celular</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold">2.</span>
                            <span>Vá em Aparelhos Conectados</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="font-bold">3.</span>
                            <span>Leia o QR Code abaixo</span>
                          </li>
                        </ol>
                      </div>

                      {/* QR Code Area */}
                      <div className="flex flex-col items-center py-6">
                        <div className="w-60 h-60 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center bg-white shadow-inner overflow-hidden relative">
                          {isLoadingQR ? (
                            <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
                          ) : qrCode ? (
                            <img src={qrCode} alt="WhatsApp QR Code" className="w-full h-full object-cover p-2" />
                          ) : (
                            <QrCode className="w-24 h-24 text-gray-300" />
                          )}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                          <div className={`w-2 h-2 rounded-full ${qrCode ? "bg-green-500" : "bg-amber-500 animate-pulse"}`} />
                          <span>{qrCode ? "Pronto para leitura!" : "A aguardar leitura do código..."}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Button
                          onClick={handleGenerateQR}
                          disabled={isLoadingQR}
                          className="bg-[#25D366] hover:bg-[#1fb855] text-white disabled:opacity-70"
                        >
                          {isLoadingQR ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                          {isLoadingQR ? "Gerando..." : "Gerar Novo QR Code"}
                        </Button>
                        <Button
                          onClick={handleDisconnectWhatsApp}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sair do WhatsApp
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Card B - AI Toggle */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="shadow-sm h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-[#6F42C1]" />
                        Atendimento Automático
                      </CardTitle>
                      <CardDescription>
                        A IA está ativada e responderá às mensagens dos seus clientes automaticamente.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <div className="flex items-center gap-4">
                        <Label htmlFor="ai-toggle" className="text-base font-semibold flex items-center gap-2">
                          {isAIEnabled ? "Ligado" : "Desligado"}
                          {isSavingAI && <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />}
                        </Label>
                        <Switch
                          id="ai-toggle"
                          checked={isAIEnabled}
                          onCheckedChange={handleToggleAI}
                          disabled={isSavingAI}
                          className="scale-150"
                        />
                      </div>
                      {isAIEnabled && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-6 flex items-center gap-2 text-sm text-green-600 font-medium"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>IA Ativa</span>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}

            {/* Horários - Card C */}
            {activeSection === "hours" && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-3"
              >
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#007BFF]" />
                      Horário de Funcionamento
                    </CardTitle>
                    <CardDescription>
                      A IA só marcará agendamentos neste intervalo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-base">Dias de Funcionamento</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
                        {daysOfWeek.map((day) => (
                          <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-2 ${
                              activeDays.includes(day)
                                ? "bg-[#007BFF] border-[#007BFF] text-white shadow-sm"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Clique nos dias para ativar/desativar o funcionamento do bot
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <Label className="text-base">Duração do Atendimento</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {durationOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setServiceDuration(option.value)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border-2 ${
                              serviceDuration === option.value
                                ? "bg-[#6F42C1] border-[#6F42C1] text-white shadow-sm"
                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Tempo de marcação entre um horário e outro
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end pt-4 border-t border-gray-100">
                      <div className="space-y-2">
                        <Label htmlFor="start-time">Das</Label>
                        <Input
                          id="start-time"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end-time">Até às</Label>
                        <Input
                          id="end-time"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="text-base"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Button onClick={handleSaveHours} className="w-full bg-[#007BFF] hover:bg-[#0056b3]">
                          Salvar Horários
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Configurações */}
            {activeSection === "settings" && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-3"
              >
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-[#6F42C1]" />
                      Configurações
                    </CardTitle>
                    <CardDescription>
                      Personalize o comportamento do seu bot
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-base">
                        <Mail className="w-4 h-4 text-gray-500" />
                        Gmail Conectado
                      </Label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-blue-300">
                            <Mail className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                            <p className="text-xs text-gray-500">Conta autenticada com Google</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                      <Label htmlFor="store-name" className="flex items-center gap-2 text-base">
                        <Store className="w-4 h-4 text-gray-500" />
                        Nome da Loja
                      </Label>
                      <Input
                        id="store-name"
                        type="text"
                        placeholder="Ex: Salão Beleza Natural"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="text-base"
                      />
                      <p className="text-xs text-gray-500">
                        Este nome será usado nas mensagens automáticas do bot
                      </p>
                    </div>

                    <div className="pt-4">
                      <Button
                        onClick={handleSaveSettings}
                        className="w-full bg-gradient-to-r from-[#007BFF] to-[#6F42C1] hover:from-[#0056b3] hover:to-[#553c9a] text-white shadow-md"
                      >
                        Salvar Configurações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Analytics */}
            {activeSection === "analytics" && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        Mensagens Respondidas Hoje
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-bold text-gray-900">47</p>
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          +12% vs ontem
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-3">
                        A IA respondeu automaticamente 47 conversas dos seus clientes
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="shadow-sm border-l-4 border-l-purple-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CalendarCheck className="w-5 h-5 text-purple-500" />
                        Agendamentos Esta Semana
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-bold text-gray-900">23</p>
                        <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          +8 novos
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-3">
                        23 horários confirmados automaticamente esta semana
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="shadow-sm border-l-4 border-l-emerald-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Zap className="w-5 h-5 text-emerald-500" />
                        Tempo Economizado
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <p className="text-5xl font-bold text-gray-900">1h 55m</p>
                      </div>
                      <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <p className="text-sm text-emerald-800 font-medium">
                          💡 Cálculo: 23 agendamentos × 5 min/cada
                        </p>
                        <p className="text-xs text-emerald-600 mt-1">
                          Tempo que você economizou não fazendo agendamentos manuais
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </div>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center py-8 border-t border-gray-200 mt-12"
          >
            <div className="flex items-center justify-center gap-2">
              <p className="text-gray-400 uppercase tracking-wide text-[14px] leading-none">
                Desenvolvido por
              </p>
              <a 
                href="https://korvenlab.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-70"
              >
                <img src="/logokorven.png" alt="Korven Lab" className="h-4 translate-y-[1px]" />
              </a>
            </div>
          </motion.footer>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        active
          ? "bg-blue-50 text-[#007BFF] font-semibold"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
