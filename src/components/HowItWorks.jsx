import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, Zap, Clock } from "lucide-react";

const STEPS = [
  {
    icon: ShieldCheck,
    title: "Segurança primeiro",
    desc: "Todos os infláveis passam por inspeção e higienização antes de cada evento.",
    color: "orange",
  },
  {
    icon: Truck,
    title: "Entrega e montagem",
    desc: "Levamos até o seu local e montamos tudo com equipamento profissional.",
    color: "teal",
  },
  {
    icon: Zap,
    title: "Energia inclusa",
    desc: "Sopradores e toda a estrutura elétrica necessária fazem parte do serviço.",
    color: "pink",
  },
  {
    icon: Clock,
    title: "Diversão garantida",
    desc: "Fique com o brinquedo pelo tempo combinado e divirta-se sem preocupações.",
    color: "yellow",
  },
];

const COLOR_STYLES = {
  orange: "bg-orange shadow-orange/30",
  teal: "bg-teal shadow-teal/30",
  pink: "bg-pink shadow-pink/30",
  yellow: "bg-yellow shadow-yellow/30",
};

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 lg:py-32 bg-cobalt text-white relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[35rem] h-[35rem] rounded-full bg-orange/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[35rem] h-[35rem] rounded-full bg-teal/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <span className="px-4 py-2 rounded-full bg-teal/15 text-teal text-sm font-bold mb-4 inline-block">
            Como funciona
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl text-balance">
            Do clique à diversão
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              className="rounded-[2rem] bg-white/5 border border-white/10 p-8 hover:bg-white/10 transition-colors"
            >
              <span className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${COLOR_STYLES[step.color]}`}>
                <step.icon className="w-7 h-7 text-white" />
              </span>
              <h3 className="font-heading text-xl mb-2">{step.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}