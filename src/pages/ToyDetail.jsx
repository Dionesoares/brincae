import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Image as UIImage } from "@/components/ui/image";
import { ArrowLeft, Ruler, Users, Calendar, Zap, MapPin, Check, MessageCircle } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

const statusMap = {
  disponivel: { label: "Disponível", cls: "bg-teal/15 text-teal" },
  no_campo: { label: "No Campo", cls: "bg-orange/15 text-orange" },
  manutencao: { label: "Em Manutenção", cls: "bg-red-100 text-red-600" },
};

export default function ToyDetail() {
  const { id } = useParams();
  const { data: toy, isLoading } = useQuery({
    queryKey: ["toy", id],
    queryFn: () => base44.entities.Toy.get(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cloud">
        <div className="w-8 h-8 border-4 border-cloud border-t-orange rounded-full animate-spin" />
      </div>
    );
  }

  if (!toy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cloud">
        <p className="font-heading text-2xl text-cobalt">Brinquedo não encontrado</p>
        <Link to="/" className="h-12 px-6 inline-flex items-center rounded-full bg-orange text-white font-bold">
          Voltar
        </Link>
      </div>
    );
  }

  const status = statusMap[toy.status] || statusMap.disponivel;

  const specs = [
    { icon: Ruler, label: "Dimensões", value: toy.dimensions },
    { icon: Users, label: "Capacidade", value: toy.capacity },
    { icon: Calendar, label: "Faixa etária", value: toy.age_range },
    { icon: MapPin, label: "Espaço mínimo", value: toy.space_required },
    { icon: Zap, label: "Energia", value: toy.energy_requirements },
  ].filter((s) => s.value);

  return (
    <div className="min-h-screen bg-cloud pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <Link to="/" className="inline-flex items-center gap-2 text-cobalt/60 hover:text-orange font-semibold mb-8">
          <ArrowLeft className="w-4 h-4" /> Voltar ao catálogo
        </Link>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Gallery 60% */}
          <div className="lg:col-span-3">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-cobalt/20">
              {toy.image_url ? (
                <UIImage
                  src={toy.image_url}
                  alt={toy.alt_text || toy.name}
                  fittingType="fill"
                  className="w-full aspect-[4/3]"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-cloud to-blue-50" />
              )}
            </div>
          </div>

          {/* Booking widget 40% sticky */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24 flex flex-col gap-6">
              <div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${status.cls}`}>
                  {status.label}
                </span>
                <h1 className="font-heading text-4xl text-cobalt mt-4 leading-tight">{toy.name}</h1>
                {toy.description && (
                  <p className="text-cobalt/70 mt-4 leading-relaxed">{toy.description}</p>
                )}
              </div>

              <div className="rounded-[2rem] bg-white shadow-[0_20px_60px_-25px_rgba(10,17,40,0.25)] p-6 flex flex-col gap-4">
                {toy.price ? (
                  <div className="flex items-end justify-between pb-4 border-b border-border">
                    <div>
                      <p className="text-xs text-cobalt/50">Valor da diária</p>
                      <p className="font-heading text-3xl text-cobalt">
                        R$ {Number(toy.price).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3">
                  {specs.map((s) => (
                    <div key={s.label} className="flex items-center gap-3 text-sm">
                      <span className="w-9 h-9 rounded-xl bg-orange/10 flex items-center justify-center">
                        <s.icon className="w-4 h-4 text-orange" />
                      </span>
                      <span className="text-cobalt/50 w-32">{s.label}</span>
                      <span className="font-semibold text-cobalt">{s.value}</span>
                    </div>
                  ))}
                </div>

                {toy.status === "disponivel" ? (
                  <a
                    href={getWhatsAppLink(`Olá! Quero reservar o brinquedo "${toy.name}".`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-14 mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-orange text-white font-bold shadow-xl shadow-orange/30 hover:scale-[1.02] transition-transform"
                  >
                    <MessageCircle className="w-5 h-5" /> Reservar pelo WhatsApp
                  </a>
                ) : (
                  <div className="h-14 mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-cloud text-cobalt/50 font-bold">
                    Indisponível no momento
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-cobalt/50 px-2">
                <Check className="w-4 h-4 text-teal" /> Entrega, montagem e energia inclusas
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}