import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

export type DashboardNavId =
  | "overview"
  | "analytics"
  | "hours"
  | "team"
  | "calendar"
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
      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${
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

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between">
        <img src="/logo.png" alt="Wagoo Logo" className="w-10 h-10 object-contain" />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <AnimatePresence>
        {(isSidebarOpen || isDesktop) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-slate-100 z-40 flex flex-col shadow-wg-popover lg:shadow-none"
          >
            <div className="pt-16 pb-10 flex flex-col items-center justify-center">
              <img src="/logo.png" alt="Wagoo Logo" className="w-32 h-32 object-contain" />
            </div>

            <nav className="flex-1 px-6 space-y-2">
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
                icon={<Users size={20} />}
                label="Apenas para Equipe"
                active={active === "team"}
                onClick={() => {
                  navigate("/dashboard/equipe");
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

            <div className="p-8 mt-auto">
              <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                <p className="font-bold text-slate-900 text-sm truncate">{storeName || "Minha Loja"}</p>
                <p className="text-xs text-slate-400 font-medium truncate">{userEmail}</p>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 font-bold text-sm hover:bg-red-50 transition-colors"
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
