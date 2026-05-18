import { ProtectedRoute } from "../components/ProtectedRoute";
import { TeamManagementPage } from "./TeamManagementPage";

export function ProtectedTeamPage() {
  return (
    <ProtectedRoute requirePayment={true}>
      <TeamManagementPage />
    </ProtectedRoute>
  );
}
