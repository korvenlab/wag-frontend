import { ProtectedRoute } from "../components/ProtectedRoute";
import { CalendarPage } from "./CalendarPage";

export function ProtectedCalendarPage() {
  return (
    <ProtectedRoute requirePayment={true}>
      <CalendarPage />
    </ProtectedRoute>
  );
}
