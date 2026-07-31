import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { FeedbackFab } from "../components/FeedbackFab";
import { AgendaWebSettingsPanel } from "../components/AgendaWebSettingsPanel";
import { AgendaWebWhatsAppPanel } from "../components/AgendaWebWhatsAppPanel";

export function AgendaWebDashboardPage() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="Wagoo" className="h-8 w-auto" />
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-widest text-[#64b34d]">
                Agenda Web
              </p>
              <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={async () => {
              await logout();
              navigate("/");
            }}
          >
            <LogOut size={16} className="mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 pb-16 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Configure sua agenda online
          </h1>
          <p className="mt-2 text-slate-500 font-medium max-w-2xl">
            Preencha negócio, horários e serviços. Opcionalmente conecte o WhatsApp da loja para
            confirmação e lembretes automáticos (sem IA).
          </p>
        </div>
        <AgendaWebWhatsAppPanel />
        <AgendaWebSettingsPanel onProfileSaved={() => void refreshProfile({ force: true })} />
      </main>
      <FeedbackFab />
    </div>
  );
}
