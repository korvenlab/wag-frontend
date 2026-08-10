import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  CreditCard,
  Link2,
  LogOut,
  Menu,
  MessageCircle,
  Settings2,
  Sparkles,
  Store,
  Users,
  X,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { FeedbackFab } from "../components/FeedbackFab";
import {
  AgendaWebSettingsPanel,
  type AgendaWebSection,
} from "../components/AgendaWebSettingsPanel";
import { AgendaWebWhatsAppPanel } from "../components/AgendaWebWhatsAppPanel";
import { AgendaWebGooglePanel } from "../components/AgendaWebGooglePanel";
import { AgendaWebPaymentsPanel } from "../components/AgendaWebPaymentsPanel";
import { ClubMembershipPanel } from "../components/ClubMembershipPanel";

const NAV: {
  id: AgendaWebSection;
  label: string;
  hint: string;
  icon: typeof Link2;
}[] = [
  {
    id: "overview",
    label: "Início e links",
    hint: "Publicar e copiar links",
    icon: Link2,
  },
  {
    id: "negocio",
    label: "Negócio",
    hint: "Nome, capa e logo",
    icon: Store,
  },
  {
    id: "horarios",
    label: "Horários",
    hint: "Funcionamento da loja",
    icon: Clock,
  },
  {
    id: "servicos",
    label: "Serviços",
    hint: "Preços e duração",
    icon: Settings2,
  },
  {
    id: "profissionais",
    label: "Profissionais",
    hint: "Quem atende",
    icon: Users,
  },
  {
    id: "agendamentos",
    label: "Agendamentos",
    hint: "Horários marcados",
    icon: CalendarDays,
  },
  {
    id: "pagamentos",
    label: "Pagamentos",
    hint: "PIX, saldo e sinal",
    icon: CreditCard,
  },
  {
    id: "clube",
    label: "Clube",
    hint: "Plano mensal",
    icon: Sparkles,
  },
  {
    id: "google",
    label: "Google Agenda",
    hint: "Salvar no calendário",
    icon: CalendarDays,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    hint: "Confirmação e lembretes",
    icon: MessageCircle,
  },
];

const SECTION_COPY: Record<
  AgendaWebSection,
  { title: string; subtitle: string }
> = {
  overview: {
    title: "Início e links",
    subtitle:
      "Publique a agenda e compartilhe o link certo: um para marcar horário, outro só para consultar.",
  },
  negocio: {
    title: "Seu negócio",
    subtitle: "Dados e visual da página que o cliente abre.",
  },
  horarios: {
    title: "Horários",
    subtitle: "Quando sua loja aceita novos agendamentos.",
  },
  servicos: {
    title: "Serviços",
    subtitle: "Serviços que o cliente escolhe ao marcar horário.",
  },
  profissionais: {
    title: "Profissionais",
    subtitle: "Opcional — o cliente escolhe quem prefere.",
  },
  agendamentos: {
    title: "Agendamentos",
    subtitle: "Quem já marcou horário pelo seu link.",
  },
  pagamentos: {
    title: "Pagamentos",
    subtitle:
      "Saldo PIX, chave para saque e sinal antecipado — tudo na conta Wagoo via Asaas.",
  },
  clube: {
    title: "Clube",
    subtitle: "Configure o plano mensal e compartilhe o link com o cliente.",
  },
  google: {
    title: "Google Agenda",
    subtitle: "Salve os horários do link na sua agenda Google e evite conflito com o que já está lá.",
  },
  whatsapp: {
    title: "WhatsApp",
    subtitle: "Conecte o número da loja para confirmação e lembretes automáticos.",
  },
};

export function AgendaWebDashboardPage() {
  const { user, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [section, setSection] = useState<AgendaWebSection>("overview");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("connect")) {
      setSection("pagamentos");
    }
  }, [searchParams]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [section]);

  const copy = SECTION_COPY[section];

  function selectSection(id: AgendaWebSection) {
    setSection(id);
    setMenuOpen(false);
  }

  const navList = (
    <nav className="space-y-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = section === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => selectSection(item.id)}
            className={
              "w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all " +
              (active
                ? "bg-[#64b34d]/10 text-slate-900 shadow-sm ring-1 ring-[#64b34d]/25"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")
            }
          >
            <span
              className={
                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 " +
                (active ? "bg-[#64b34d] text-white" : "bg-slate-100 text-slate-400")
              }
            >
              <Icon size={16} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold tracking-tight">{item.label}</span>
              <span className="block text-[11px] font-medium text-slate-400 truncate">
                {item.hint}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={20} />
            </Button>
            <Link
              to="/"
              title="Wagoo — página inicial"
              aria-label="Ir para a página inicial do Wagoo"
              className="shrink-0"
            >
              <img src="/logo.png" alt="Wagoo" className="h-8 w-auto" />
            </Link>
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

      {menuOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Fechar menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[min(100%,20rem)] bg-white p-4 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-slate-900">Menu</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setMenuOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>
            {navList}
          </aside>
        </div>
      ) : null}

      <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-3 shadow-wg-subtle">
              <p className="px-3 pt-2 pb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Configurar
              </p>
              {navList}
            </div>
          </aside>

          <main className="flex-1 min-w-0 space-y-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64b34d] mb-1 lg:hidden">
                {NAV.find((n) => n.id === section)?.label}
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {copy.title}
              </h1>
              <p className="mt-2 text-slate-500 font-medium max-w-2xl">{copy.subtitle}</p>
            </div>

            {/* Atalhos horizontais no mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 lg:hidden scrollbar-none">
              {NAV.map((item) => {
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectSection(item.id)}
                    className={
                      "shrink-0 px-3 py-2 rounded-full text-xs font-bold border transition-colors " +
                      (active
                        ? "bg-[#64b34d] text-white border-[#64b34d]"
                        : "bg-white text-slate-600 border-slate-200")
                    }
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {section === "whatsapp" ? (
              <AgendaWebWhatsAppPanel />
            ) : section === "google" ? (
              <AgendaWebGooglePanel />
            ) : section === "pagamentos" ? (
              <AgendaWebPaymentsPanel />
            ) : section === "clube" ? (
              <ClubMembershipPanel />
            ) : (
              <AgendaWebSettingsPanel
                section={section}
                onNavigateSection={selectSection}
                onProfileSaved={() => void refreshProfile({ force: true })}
              />
            )}
          </main>
        </div>
      </div>
      <FeedbackFab />
    </div>
  );
}
