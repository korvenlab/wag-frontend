import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePayment?: boolean;
}

export function ProtectedRoute({ children, requirePayment = false }: ProtectedRouteProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (requirePayment && !user.hasPaid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50/30 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center"
            >
              <Lock className="w-10 h-10 text-amber-600" />
            </motion.div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Acesso Restrito
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Complete o pagamento do plano para acessar o Dashboard e todas as funcionalidades do WAG BOT.
            </p>

            <button
              onClick={() => {
                navigate("/");
                setTimeout(() => {
                  const element = document.getElementById("precos");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }, 100);
              }}
              className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-[#007BFF] to-[#6F42C1] text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Ver Planos
            </button>

            <button
              onClick={() => navigate("/")}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Voltar para início
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}