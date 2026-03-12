import { ProtectedRoute } from "../components/ProtectedRoute";
import { Dashboard } from "./Dashboard";

export function ProtectedDashboard() {
  return (
    <ProtectedRoute requirePayment={true}>
      <Dashboard />
    </ProtectedRoute>
  );
}
