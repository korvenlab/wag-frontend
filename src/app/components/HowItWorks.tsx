import { MessageCircle, Calendar, CheckCircle2 } from "lucide-react";
import { useState, type ReactNode } from "react";

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      data-gsap-section
      className="relative py-28 md:py-36 bg-[var(--wagoo-paper)] overflow-hidden"
    >
      <div className="absolute top-0 left-1/4 w-[560px] h-[560px] bg-[#64b34d]/10 blur-[140px] rounded-full -z-10" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] -z-10"
        style={{
          backgroundImage:
            "radial-gradient(rgba(15,23,42,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 md:mb-28 max-w-3xl mx-auto">
          <span
            data-gsap="heading"
            className="px-4 py-1.5 rounded-full bg-[#64b34d]/12 text-[#4d8f3b] text-[11px] font-bold tracking-[0.22em] uppercase inline-block mb-6 border border-[#64b34d]/20"
          >
            Fluxo real
          </span>
          <h2
            data-gsap="heading"
            className="font-[family-name:var(--font-display)] text-4xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[0.92] tracking-tight"
          >
            Do WhatsApp ao Calendar
            <span className="block text-[#64b34d]">sem você no meio.</span>
          </h2>
          <p
            data-gsap="heading"
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mt-7 font-medium leading-relaxed"
          >
            Três passos. O cliente fala como sempre fala — o Wagoo cuida da agenda.
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8 lg:gap-10">
          <div className="hidden md:block absolute top-[38%] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-[#64b34d]/35 to-transparent -z-10" />

          <StepCard
            icon={<MessageCircle size={28} />}
            step="01"
            title="Cliente manda mensagem"
            description="No WhatsApp, no tom dele. Pediu horário — o Wagoo entende e responde."
          />
          <StepCard
            icon={<Calendar size={28} />}
            step="02"
            title="Consulta o Google Calendar"
            description="Vê o que está livre na sua agenda real, nos horários que você definiu."
          />
          <StepCard
            icon={<CheckCircle2 size={28} />}
            step="03"
            title="Confirma e sincroniza"
            description="Marca o horário, avisa o cliente e aparece na sua agenda — pronto."
          />
        </div>
      </div>
    </section>
  );
}

function StepCard({
  icon,
  step,
  title,
  description,
}: {
  icon: ReactNode;
  step: string;
  title: string;
  description: string;
}) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotateX(((e.clientY - rect.top - centerY) / centerY) * -5);
    setRotateY(((e.clientX - rect.left - centerX) / centerX) * 5);
  };

  return (
    <div
      data-gsap="item"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setRotateX(0);
        setRotateY(0);
      }}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: "transform 0.12s ease-out",
      }}
      className="relative group"
    >
      <div className="relative bg-white p-9 lg:p-11 rounded-[36px] border border-slate-200/90 shadow-wg-card group-hover:shadow-wg-card-hover transition-[box-shadow] duration-500 h-full flex flex-col items-start overflow-hidden">
        <div className="absolute -right-2 top-6 text-6xl font-black text-slate-100 group-hover:text-[#64b34d]/10 transition-colors pointer-events-none font-[family-name:var(--font-display)]">
          {step}
        </div>

        <div className="w-16 h-16 rounded-[22px] bg-[#64b34d]/10 flex items-center justify-center text-[#64b34d] mb-8 group-hover:bg-[#64b34d] group-hover:text-white transition-all duration-500 border border-[#64b34d]/15">
          {icon}
        </div>

        <div className="space-y-3 relative">
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-slate-500 leading-relaxed font-medium text-[15px]">{description}</p>
        </div>
      </div>
    </div>
  );
}
