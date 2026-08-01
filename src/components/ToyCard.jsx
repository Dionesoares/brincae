import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Ruler, Users, ArrowUpRight } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";

const statusMap = {
  disponivel: { label: "Disponível", cls: "bg-teal/15 text-teal" },
  no_campo: { label: "No Campo", cls: "bg-orange/15 text-orange" },
  manutencao: { label: "Manutenção", cls: "bg-red-100 text-red-600" },
};

export default function ToyCard({ toy, index = 0 }) {
  const status = statusMap[toy.status] || statusMap.disponivel;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: (index % 3) * 0.08 }}
    >
      <Link
        to={`/brinquedo/${toy.id}`}
        className="group block rounded-[2rem] bg-white shadow-[0_20px_60px_-25px_rgba(10,17,40,0.25)] hover:shadow-[0_30px_80px_-20px_rgba(255,95,31,0.35)] transition-all duration-500 overflow-hidden hover:-translate-y-2 active:scale-[0.98]"
      >
        <div className="relative overflow-hidden rounded-[2rem]">
          {toy.image_url ? (
            <UIImage
              src={toy.image_url}
              alt={toy.alt_text || toy.name}
              fittingType="fill"
              className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-cloud to-blue-50 flex items-center justify-center">
              <span className="text-cobalt/30 font-heading text-lg">Sem imagem</span>
            </div>
          )}
          <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold ${status.cls}`}>
            {status.label}
          </span>
          {toy.featured && (
            <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink to-yellow text-white shadow-lg">
              Destaque
            </span>
          )}
          <span className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-cobalt opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-5 h-5" />
          </span>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <h3 className="font-heading text-xl text-cobalt leading-tight">{toy.name}</h3>
            {toy.description && (
              <p className="text-sm text-cobalt/60 mt-1 line-clamp-2">{toy.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-cobalt/70">
            {toy.dimensions && (
              <span className="inline-flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-orange" /> {toy.dimensions}
              </span>
            )}
            {toy.capacity && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange" /> {toy.capacity}
              </span>
            )}
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-border">
            {toy.price ? (
              <div>
                <p className="text-xs text-cobalt/50">A partir de</p>
                <p className="font-heading text-2xl text-cobalt">
                  R$ {Number(toy.price).toLocaleString("pt-BR")}
                </p>
              </div>
            ) : (
              <p className="text-sm text-cobalt/50">Consulte valores</p>
            )}
            <span className="h-10 px-5 inline-flex items-center rounded-full bg-cobalt text-white text-sm font-bold group-hover:bg-orange transition-colors">
              Reservar
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}