import { motion } from "motion/react";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Footer Links */}
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center">
                {/* ALERTA: A imagem agora é chamada diretamente da pasta public com o nome logokorven.png */}
                <img 
                  src="/logokorven.png"
                  alt="WAG BOT Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#007BFF] to-[#6F42C1] bg-clip-text text-transparent">
                WAG BOT
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Automatize seus agendamentos e recupere seu tempo. Simples,
              rápido e profissional.
            </p>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-gray-900 font-semibold mb-4">Produto</h4>
            <ul className="space-y-3">
              <FooterLink>Recursos</FooterLink>
              <FooterLink>Preços</FooterLink>
              <FooterLink>Integrações</FooterLink>
              <FooterLink>Atualizações</FooterLink>
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-gray-900 font-semibold mb-4">Empresa</h4>
            <ul className="space-y-3">
              <FooterLink>Sobre Nós</FooterLink>
              <FooterLink>Blog</FooterLink>
              <FooterLink>Carreiras</FooterLink>
              <FooterLink>Contato</FooterLink>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <FooterLink>Termos de Uso</FooterLink>
              <FooterLink>Privacidade</FooterLink>
              <FooterLink>LGPD</FooterLink>
              <FooterLink>Cookies</FooterLink>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-center gap-6"
        >
          <p className="text-gray-500 text-sm">
            © 2026 WAG BOT. Todos os direitos reservados.
          </p>
        </motion.div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#007BFF] via-[#6F42C1] to-[#007BFF]" />
    </footer>
  );
}

function FooterLink({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <a
        href="#"
        className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
      >
        {children}
      </a>
    </li>
  );
}
