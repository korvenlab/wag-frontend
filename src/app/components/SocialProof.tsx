import { motion } from "motion/react";
import { Star } from "lucide-react";

export function SocialProof() {
  const companies = [
    "TechCorp",
    "InnovateLab",
    "CloudSync",
    "DataFlow",
    "NextGen",
    "SmartHub",
  ];

  return (
    <section className="relative py-20 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <span className="text-gray-900 font-semibold">4.9/5</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">Mais de 500 avaliações</span>
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-3xl md:text-5xl font-bold text-center mb-16 text-gray-900"
        >
          Confiado por{" "}
          <span className="bg-gradient-to-r from-[#007BFF] to-[#6F42C1] bg-clip-text text-transparent">
            Milhares de Profissionais
          </span>
        </motion.h2>

        {/* Company Logos Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-12 items-center justify-center flex-wrap md:flex-nowrap"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {companies.map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.1 }}
                className="relative group"
              >
                <div className="px-8 py-4 rounded-xl bg-gray-50 border border-gray-200 shadow-wg-subtle hover:border-gray-300 hover:bg-white hover:shadow-wg-card transition-[box-shadow,background-color,border-color]">
                  <span className="text-xl font-bold text-gray-600 group-hover:text-gray-900 transition-colors">
                    {company}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
        >
          <StatCard number="10,000+" label="Agendamentos/Mês" />
          <StatCard number="500+" label="Empresas Ativas" />
          <StatCard number="98%" label="Taxa de Sucesso" />
          <StatCard number="24/7" label="Disponibilidade" />
        </motion.div>
      </div>
    </section>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
      className="text-center p-6 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 transition-all shadow-sm"
    >
      <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#007BFF] to-[#6F42C1] bg-clip-text text-transparent">
        {number}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </motion.div>
  );
}