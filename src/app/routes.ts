import { createBrowserRouter } from "react-router";
import { HomePage } from "./App";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedDashboard } from "./pages/ProtectedDashboard";
import { ProtectedTeamPage } from "./pages/ProtectedTeamPage";
import { ProtectedCalendarPage } from "./pages/ProtectedCalendarPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { PublicCalendarPage } from "./pages/PublicCalendarPage";
import { AutomatizarAgendamentoWhatsappPage } from "./pages/AutomatizarAgendamentoWhatsappPage";
import { AgendaWhatsappGoogleCalendarPage } from "./pages/AgendaWhatsappGoogleCalendarPage";
import { WagooVsPlanilhaPage } from "./pages/WagooVsPlanilhaPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/automatizar-agendamento-whatsapp",
    Component: AutomatizarAgendamentoWhatsappPage,
  },
  {
    path: "/agenda-whatsapp-google-calendar",
    Component: AgendaWhatsappGoogleCalendarPage,
  },
  {
    path: "/wagoo-vs-planilha",
    Component: WagooVsPlanilhaPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    Component: ProtectedDashboard,
  },
  {
    path: "/dashboard/equipe",
    Component: ProtectedTeamPage,
  },
  {
    path: "/dashboard/calendario",
    Component: ProtectedCalendarPage,
  },
  {
    path: "/privacidade",
    Component: PrivacyPage,
  },
  {
    path: "/termos",
    Component: TermsPage,
  },
  {
    path: "/calendario/publico/:slug",
    Component: PublicCalendarPage,
  },
]);
