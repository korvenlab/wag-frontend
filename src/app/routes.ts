import { createBrowserRouter, redirect } from "react-router";
import { HomePage } from "./App";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedDashboard } from "./pages/ProtectedDashboard";
import { ProtectedTeamPage } from "./pages/ProtectedTeamPage";
import { ProtectedCalendarPage } from "./pages/ProtectedCalendarPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { PublicCalendarPage } from "./pages/PublicCalendarPage";
import { PublicBookingPage } from "./pages/PublicBookingPage";
import { PublicBookingAgendaPage } from "./pages/PublicBookingAgendaPage";
import { PublicClubClientPage } from "./pages/PublicClubClientPage";
import { ProtectedAgendaWebPage } from "./pages/ProtectedAgendaWebPage";
import { AgendamentoHubPage } from "./pages/AgendamentoHubPage";
import { AgendamentoWhatsappPage } from "./pages/AgendamentoWhatsappPage";
import { AgendaWhatsappGoogleCalendarPage } from "./pages/AgendaWhatsappGoogleCalendarPage";
import { WagooVsPlanilhaPage } from "./pages/WagooVsPlanilhaPage";
import { RedirectAutomatizarAgendamentoWhatsapp } from "./pages/RedirectAutomatizarAgendamentoWhatsapp";
import { PricingPage } from "./pages/PricingPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/precos",
    Component: PricingPage,
  },
  {
    path: "/prices",
    loader: () => redirect("/precos"),
  },
  {
    path: "/agendamento",
    Component: AgendamentoHubPage,
  },
  {
    path: "/agendamento/whatsapp",
    Component: AgendamentoWhatsappPage,
  },
  {
    path: "/automatizar-agendamento-whatsapp",
    Component: RedirectAutomatizarAgendamentoWhatsapp,
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
    path: "/dashboard/agenda-web",
    Component: ProtectedAgendaWebPage,
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
  {
    path: "/a/:slug",
    Component: PublicBookingPage,
  },
  {
    path: "/a/:slug/agenda",
    Component: PublicBookingAgendaPage,
  },
  {
    path: "/a/:slug/cliente",
    Component: PublicClubClientPage,
  },
]);
