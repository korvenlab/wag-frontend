import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clock, Settings, LogOut, Menu, X, QrCode, Bot, RefreshCw, Phone,
  BarChart3, MessageSquare, CalendarCheck, Zap, Loader2, Check, Timer,
  Coffee, Moon, Sun, Copy
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

// Definição da estrutura de horários por dia
const INITIAL_HOURS = {
  startTime: "08:00", endTime: "12:00", isTurno1Active: true,
  startTime2: "14:00", endTime2: "18:00", isTurno2Active: true,
  startTime3: "19:00", endTime3: "22:00", isTurno3Active: false,
};

const DAYS_OF_WEEK = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

export function Dashboard() {
  const [activeSection, setActiveSection] = useState("hours");
  const [selectedDay, setSelectedDay] = useState("Segunda-feira");
  
  // Estado principal que guarda os horários de CADA dia
  const [workingHours, setWorkingHours] = useState<Record<string, any>>(
    DAYS_OF_WEEK.reduce((acc, day) => ({ ...acc, [day]: { ...INITIAL_HOURS } }), {})
  );

  const [serviceDuration, setServiceDuration] = useState<number>(30);
  const [storeName, setStoreName] = useState("");
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [showHoursSuccess, setShowHoursSuccess] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Função para atualizar um campo específico de um dia específico
  const updateDayHours = (day: string, field: string, value: any) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  // Feature: Copiar horário do dia atual para todos os outros
  const copyToAllDays = () => {
    const currentSettings = workingHours[selectedDay];
    const newSchedule = DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: { ...currentSettings }
    }), {});
    setWorkingHours(newSchedule);
  };

  const handleSaveHours = async () => {
    setIsSavingHours(true);
    try {
      await fetch(`${backendUrl}/api/settings/hours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          workingHours, // Enviamos o objeto completo com todos os dias
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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Simplificada para o exemplo) */}
      <aside className="w-64 bg-white border-r p-6 hidden lg:block">
         <h1 className="font-bold text-xl mb-8">WAG BOT</h1>
         <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveSection("overview")}>Visão Geral</Button>
            <Button variant={activeSection === "hours" ? "default" : "ghost"} className="w-full justify-start" onClick={() => setActiveSection("hours")}>Horários</Button>
         </nav>
      </aside>

      <main className="flex-1 p-8">
        {activeSection === "hours" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="max-w-5xl mx-auto shadow-lg">
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2 text-blue-600">
                      <Clock className="w-6 h-6" /> Configuração por Dia
                    </CardTitle>
                    <CardDescription>Defina turnos específicos para cada dia da semana.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyToAllDays} className="gap-2">
                    <Copy className="w-4 h-4" /> Replicar p/ todos os dias
                  </Button>
                </div>
              </CardHeader>

              {/* Seletor de Dias (Tabs) */}
              <div className="flex flex-wrap gap-2 p-4 bg-slate-50">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedDay === day 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "bg-white text-gray-500 hover:bg-gray-100 border"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <CardContent className="pt-8 space-y-8">
                {/* Configuração do Dia Selecionado */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Turno 1 */}
                  <div className={`p-5 rounded-2xl border-2 transition-all ${workingHours[selectedDay].isTurno1Active ? "bg-blue-50/50 border-blue-200" : "bg-gray-50 border-transparent opacity-50"}`}>
                    <div className="flex items-center justify-between mb-6">
                      <Label className="flex items-center gap-2 text-blue-700 font-bold"><Sun className="w-4 h-4" /> 1º Turno</Label>
                      <Switch 
                        checked={workingHours[selectedDay].isTurno1Active} 
                        onCheckedChange={(v) => updateDayHours(selectedDay, "isTurno1Active", v)} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Abre</span>
                        <Input type="time" value={workingHours[selectedDay].startTime} onChange={(e) => updateDayHours(selectedDay, "startTime", e.target.value)} disabled={!workingHours[selectedDay].isTurno1Active} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Fecha</span>
                        <Input type="time" value={workingHours[selectedDay].endTime} onChange={(e) => updateDayHours(selectedDay, "endTime", e.target.value)} disabled={!workingHours[selectedDay].isTurno1Active} />
                      </div>
                    </div>
                  </div>

                  {/* Turno 2 */}
                  <div className={`p-5 rounded-2xl border-2 transition-all ${workingHours[selectedDay].isTurno2Active ? "bg-purple-50/50 border-purple-200" : "bg-gray-50 border-transparent opacity-50"}`}>
                    <div className="flex items-center justify-between mb-6">
                      <Label className="flex items-center gap-2 text-purple-700 font-bold"><Coffee className="w-4 h-4" /> 2º Turno</Label>
                      <Switch 
                        checked={workingHours[selectedDay].isTurno2Active} 
                        onCheckedChange={(v) => updateDayHours(selectedDay, "isTurno2Active", v)} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Abre</span>
                        <Input type="time" value={workingHours[selectedDay].startTime2} onChange={(e) => updateDayHours(selectedDay, "startTime2", e.target.value)} disabled={!workingHours[selectedDay].isTurno2Active} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Fecha</span>
                        <Input type="time" value={workingHours[selectedDay].endTime2} onChange={(e) => updateDayHours(selectedDay, "endTime2", e.target.value)} disabled={!workingHours[selectedDay].isTurno2Active} />
                      </div>
                    </div>
                  </div>

                  {/* Turno 3 */}
                  <div className={`p-5 rounded-2xl border-2 transition-all ${workingHours[selectedDay].isTurno3Active ? "bg-indigo-50/50 border-indigo-200" : "bg-gray-50 border-transparent opacity-50"}`}>
                    <div className="flex items-center justify-between mb-6">
                      <Label className="flex items-center gap-2 text-indigo-700 font-bold"><Moon className="w-4 h-4" /> 3º Turno</Label>
                      <Switch 
                        checked={workingHours[selectedDay].isTurno3Active} 
                        onCheckedChange={(v) => updateDayHours(selectedDay, "isTurno3Active", v)} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Abre</span>
                        <Input type="time" value={workingHours[selectedDay].startTime3} onChange={(e) => updateDayHours(selectedDay, "startTime3", e.target.value)} disabled={!workingHours[selectedDay].isTurno3Active} />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Fecha</span>
                        <Input type="time" value={workingHours[selectedDay].endTime3} onChange={(e) => updateDayHours(selectedDay, "endTime3", e.target.value)} disabled={!workingHours[selectedDay].isTurno3Active} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rodapé de Ações */}
                <div className="pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3 w-full max-w-xs">
                    <Label className="whitespace-nowrap text-sm font-semibold">Duração padrão:</Label>
                    <Input type="number" value={serviceDuration} onChange={(e) => setServiceDuration(Number(e.target.value))} className="w-20" />
                    <span className="text-xs text-gray-400">min</span>
                  </div>
                  <Button onClick={handleSaveHours} disabled={isSavingHours} className="w-full sm:w-64 bg-blue-600 hover:bg-blue-700">
                    {isSavingHours ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Agenda Completa"}
                  </Button>
                </div>
                {showHoursSuccess && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-sm font-medium text-center flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Calendário semanal atualizado com sucesso!
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
