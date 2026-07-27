import { Navigate } from "react-router";

/** Redirect permanente da URL flat antiga para a hierarquia /agendamento/whatsapp */
export function RedirectAutomatizarAgendamentoWhatsapp() {
  return <Navigate to="/agendamento/whatsapp" replace />;
}
