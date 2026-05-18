import { createBrowserRouter } from "react-router";
import { HomePage } from "./App";
import { LoginPage } from "./pages/LoginPage";
import { Dashboard } from "./pages/Dashboard";
import { ProtectedDashboard } from "./pages/ProtectedDashboard";
import { ProtectedTeamPage } from "./pages/ProtectedTeamPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
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
  // Novas rotas para o Google Auth
  {
    path: "/privacidade",
    Component: PrivacyPage,
  },
  {
    path: "/termos",
    Component: TermsPage,
  },
]);
