import { motion } from "framer-motion";
import { useNavigate } from "react-router";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Footer Links - Grid Ajustado para 2 Colunas no Desktop */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-48 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="Wagoobot Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
              Automatize seus agendamentos e recupere seu tempo. Simples,
              rápido e profissional. O Wagoo transforma conversas de WhatsApp em clientes agendados.
            </p>
          </motion.div>

          {/* Legal - Botões com direcionamento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="md:text-right"
          >
            <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 flex flex-col md:items-end">
              <FooterLink onClick={() => navigate("/termos")}>Termos de Uso</FooterLink>
              <FooterLink onClick={() => navigate("/privacidade")}>Privacidade</FooterLink>
              <FooterLink onClick={() => navigate("/privacidade")}>LGPD</FooterLink>
              <FooterLink onClick={() => navigate("/privacidade")}>Cookies</FooterLink>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar com Logo Korven Lab */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Desenvolvido por</span>
            <img 
              src="/logokorven.png" 
              alt="Korven Lab Logo" 
              className="h-6 object-contain grayscale hover:grayscale-0 transition-all"
            />
          </div>
          
          <p className="text-gray-500 text-sm">
            © 2026 — Korven Lab — Todos os direitos reservados
          </p>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#007BFF] via-[#6F42C1] to-[#007BFF]" />
    </footer>
  );
}

// Sub-componente de link ajustado para ser um botão de navegação
function FooterLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium bg-transparent border-none p-0 cursor-pointer"
      >
        {children}
      </button>
    </li>
  );
}
