import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Dashboard } from "./Dashboard";
import { useAuth } from "../context/AuthContext";
import { tierIsAgendaWebOnly } from "../lib/wagooPlans";

function DashboardOrAgendaRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (tierIsAgendaWebOnly(user?.subscriptionTier)) {
      navigate("/dashboard/agenda-web", { replace: true });
    }
  }, [user?.subscriptionTier, navigate]);

  if (tierIsAgendaWebOnly(user?.subscriptionTier)) {
    return null;
  }

  return <Dashboard />;
}

export function ProtectedDashboard() {
  return (
    <ProtectedRoute requirePayment={true}>
      <DashboardOrAgendaRedirect />
    </ProtectedRoute>
  );
}
