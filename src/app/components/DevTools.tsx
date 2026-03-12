import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";
import { DollarSign, X } from "lucide-react";
import { useState } from "react";

export function DevTools() {
  const { user, updatePaymentStatus } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  if (!user || !isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 max-w-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">🛠️ Painel de Testes</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-600">
          Status: {user.hasPaid ? "✅ Pago" : "❌ Não pago"}
        </p>

        <button
          onClick={() => updatePaymentStatus(!user.hasPaid)}
          className={`w-full px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            user.hasPaid
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-gradient-to-r from-[#007BFF] to-[#6F42C1] text-white hover:shadow-lg"
          }`}
        >
          <DollarSign size={16} />
          {user.hasPaid ? "Remover Pagamento" : "Simular Pagamento"}
        </button>

        <p className="text-xs text-gray-400 mt-2">
          Use este botão para testar o acesso ao Dashboard
        </p>
      </div>
    </motion.div>
  );
}
