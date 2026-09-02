import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Users,
  CalendarDays,
  ChevronRight,
  Bell,
  Link2,
  Scissors,
  Wallet,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";

export type DashboardNavId =
  | "overview"
  | "analytics"
  | "hours"
  | "reminders"
  | "team"
  | "calendar"
  | "services"
  | "payments"
  | "club"
  | "agenda-web"
  | "settings";

type DashboardSidebarProps = {
  active: DashboardNavId;
  storeName: string;
  userEmail?: string | null;
  onLogout: () => void;
};

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
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all min-h-[52px] lg:min-h-0 ${
        active
          ? "bg-slate-50 text-slate-900 shadow-wg-subtle"
          : "text-slate-400 hover:text-slate-700 hover:bg-slate-50/50"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className={active ? "text-[#64b34d]" : "text-slate-300"}>{icon}</span>
        <span className="text-sm font-bold tracking-tight">{label}</span>
      </div>
      {active && <ChevronRight size={14} className="text-slate-300" />}
    </button>
  );
}

export function DashboardSidebar({
  active,
  storeName,
  userEmail,
  onLogout,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const goDashboard = (section?: string) => {
    navigate("/dashboard", section ? { state: { section } } : undefined);
    setIsSidebarOpen(false);
  };

  useBodyScrollLock(isSidebarOpen && !isDesktop, 1023);

  const navBlock = (
    <nav className="flex-1 px-6 space-y-2 overflow-y-auto overscroll-contain wag-mobile-scroll">
      <NavItem
        icon={<LayoutDashboard size={20} />}
        label="Visão Geral"
        active={active === "overview"}
        onClick={() => goDashboard("overview")}
      />
      <NavItem
        icon={<BarChart3 size={20} />}
        label="Analytics"
        active={active === "analytics"}
        onClick={() => goDashboard("analytics")}
      />
      <NavItem
        icon={<CalendarDays size={20} />}
        label="Calendário"
        active={active === "calendar"}
        onClick={() => {
          navigate("/dashboard/calendario");
          setIsSidebarOpen(false);
        }}
      />
      <NavItem
        icon={<Clock size={20} />}
        label="Horários"
        active={active === "hours"}
        onClick={() => goDashboard("hours")}
      />
      <NavItem
        icon={<Bell size={20} />}
        label="Lembretes"
        active={active === "reminders"}
        onClick={() => goDashboard("reminders")}
      />
      <NavItem
        icon={<Users size={20} />}
        label="Gerenciar Equipe"
        active={active === "team"}
        onClick={() => {
          navigate("/dashboard/equipe");
          setIsSidebarOpen(false);
        }}
      />
      <NavItem
        icon={<Scissors size={20} />}
        label="Serviços"
        active={active === "services"}
        onClick={() => goDashboard("services")}
      />
      <NavItem
        icon={<Wallet size={20} />}
        label="Pagamentos"
        active={active === "payments"}
        onClick={() => goDashboard("payments")}
      />
      <NavItem
        icon={<Sparkles size={20} />}
        label="Clube"
        active={active === "club"}
        onClick={() => goDashboard("club")}
      />
      <NavItem
        icon={<Link2 size={20} />}
        label="Agenda Web"
        active={active === "agenda-web"}
        onClick={() => {
          navigate("/dashboard/agenda-web");
          setIsSidebarOpen(false);
        }}
      />
      <NavItem
        icon={<Settings size={20} />}
        label="Configurações"
        active={active === "settings"}
        onClick={() => goDashboard("settings")}
      />
    </nav>
  );

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b wag-mobile-top-bar flex items-center justify-between pb-3">
        <Link to="/" title="Wagoo — página inicial" aria-label="Ir para a página inicial do Wagoo">
          <img src="/logo.png" alt="Wagoo Logo" className="w-11 h-11 object-contain" />
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full wag-touch-target"
          aria-label={isSidebarOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Backdrop mobile */}
      {isSidebarOpen && !isDesktop ? (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] wag-mobile-drawer-backdrop"
          aria-label="Fechar menu"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <AnimatePresence>
        {(isSidebarOpen || isDesktop) && (
          <motion.aside
            initial={isDesktop ? false : { x: -300 }}
            animate={{ x: 0 }}
            exit={isDesktop ? undefined : { x: -300 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed top-0 left-0 h-screen w-72 max-w-[85vw] bg-white border-r border-slate-100 z-[45] flex flex-col shadow-wg-popover lg:shadow-none lg:max-w-none"
            style={{
              paddingTop: isDesktop ? undefined : "max(4.5rem, calc(env(safe-area-inset-top) + 3.5rem))",
            }}
          >
            <div className="pt-4 lg:pt-10 pb-6 px-6 flex flex-col items-center justify-center shrink-0">
              <Link
                to="/"
                title="Wagoo — página inicial"
                aria-label="Ir para a página inicial do Wagoo"
                className="block w-full max-w-[220px]"
              >
                <img
                  src="/logo.png"
                  alt="Wagoo Logo"
                  className="w-full h-auto object-contain"
                />
              </Link>
            </div>

            {navBlock}

            <div className="p-6 lg:p-8 mt-auto wag-safe-bottom shrink-0">
              <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                <p className="font-bold text-slate-900 text-sm truncate">{storeName || "Minha Loja"}</p>
                <p className="text-xs text-slate-400 font-medium truncate">{userEmail}</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} /> Sair
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
