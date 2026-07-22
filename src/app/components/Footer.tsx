import { motion } from "motion/react";
import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col items-center text-center">
          
          {/* Logo Principal Wagoo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <img 
              src="/logo.png" 
              alt="Wagoo Logo" 
              className="h-12 mx-auto object-contain mb-4"
            />
            <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
              Automatize seus agendamentos e recupere seu tempo. Simples,
              rápido e profissional. O Wagoo transforma conversas de WhatsApp em clientes agendados.
            </p>
          </motion.div>

          {/* Legal - Centralizado com tags <a> reais para o Google Crawler */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h4 className="text-gray-900 font-bold uppercase tracking-wider text-xs mb-6">Legal</h4>
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
              <FooterLink to="/termos">Termos de Uso</FooterLink>
              <FooterLink to="/privacidade">Política de Privacidade</FooterLink>
              <FooterLink to="/privacidade">LGPD</FooterLink>
              <FooterLink to="/privacidade">Cookies</FooterLink>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="pt-8 border-t border-gray-200 flex flex-col items-center gap-8"
        >
          {/* Korven Lab Branding */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">Desenvolvido por</span>
            <a 
              href="https://korvenlab.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105 active:scale-95"
            >
              <img 
                src="/logokorven.png" 
                alt="Korven Lab" 
                className="h-8 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
              />
            </a>
          </div>
          
          <p className="text-gray-400 text-xs">
            © 2026 — Korven Lab — Todos os direitos reservados
          </p>
        </motion.div>
      </div>

      {/* Bottom Gradient Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#007BFF] via-[#6F42C1] to-[#007BFF]" />
    </footer>
  );
}

// Componente FooterLink atualizado para usar a tag Link (<a>)
function FooterLink({ children, to }: { children: React.ReactNode; to: string }) {
  return (
    <li>
      <Link
        to={to}
        className="text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium decoration-none rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50"
      >
        {children}
      </Link>
    </li>
  );
}
