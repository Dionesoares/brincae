import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";
import { getWhatsAppLink } from "@/lib/whatsapp";

const HERO_IMG = "/logo-brincae.png";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-40">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cloud via-cloud to-blue-50" />
      <div className="absolute -top-32 -right-32 w-[40rem] h-[40rem] rounded-full bg-orange/10 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-[40rem] h-[40rem] rounded-full bg-teal/10 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-[24rem] h-[24rem] rounded-full bg-pink/10 blur-3xl" />
      <div className="absolute bottom-10 right-1/4 w-[20rem] h-[20rem] rounded-full bg-yellow/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 items-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          className="flex flex-col gap-6"
        >
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-cobalt text-balance">
            Reserve sua
            <span className="block text-orange">diversão</span>
            agora
          </h1>

          <p className="text-lg text-cobalt/70 max-w-md leading-relaxed">
            Brinquedos infláveis de alto impacto para festas e eventos em Palmas e região.
            Montagem, segurança e diversão garantidas.
          </p>

          <div className="flex flex-wrap gap-4 mt-2">
            <a
              href="#brinquedos"
              className="h-14 px-8 inline-flex items-center gap-2 rounded-full bg-orange text-white font-bold shadow-xl shadow-orange/30 hover:scale-105 transition-transform"
            >
              Ver Brinquedos <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href={getWhatsAppLink("Olá! Quero saber mais sobre os brinquedos infláveis Brincaê Fest.")}
              target="_blank"
              rel="noopener noreferrer"
              className="h-14 px-8 inline-flex items-center rounded-full bg-white text-cobalt font-bold border-2 border-cobalt/10 hover:border-orange transition-colors"
            >
              Falar com a gente
            </a>
          </div>

          <div className="flex gap-8 mt-6">
            <div>
              <p className="font-heading text-3xl text-cobalt">+30</p>
              <p className="text-sm text-cobalt/60">Brinquedos</p>
            </div>
            <div>
              <p className="font-heading text-3xl text-cobalt">+500</p>
              <p className="text-sm text-cobalt/60">Festas realizadas</p>
            </div>
            <div>
              <p className="font-heading text-3xl text-yellow">100%</p>
              <p className="text-sm text-cobalt/60">Seguro</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-cobalt/20 animate-float bg-gradient-to-br from-cloud to-blue-50 flex items-center justify-center aspect-square p-4">
            <UIImage
              src={HERO_IMG}
              alt="Logomarca Brincaê Infláveis"
              fittingType="fit"
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}