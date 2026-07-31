import { ProtectedRoute } from "../components/ProtectedRoute";
import { AgendaWebDashboardPage } from "./AgendaWebDashboardPage";

export function ProtectedAgendaWebPage() {
  return (
    <ProtectedRoute requirePayment={true}>
      <AgendaWebDashboardPage />
    </ProtectedRoute>
  );
}
