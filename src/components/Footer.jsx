import React from "react";
import { Mail, MapPin, Phone, Wind, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contato" className="bg-cobalt text-white relative overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] rounded-full bg-orange/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <span className="px-4 py-2 rounded-full bg-teal/15 text-teal text-sm font-bold mb-6 inline-block">
              Fale com a gente
            </span>
            <h2 className="font-heading text-4xl sm:text-5xl text-balance mb-6">
              Vamos planejar
              <span className="block text-orange">sua festa?</span>
            </h2>
            <p className="text-white/60 max-w-md mb-8">
              Entre em contato e reserve o brinquedo perfeito para o seu evento. Respondemos rapidinho.
            </p>

            <div className="flex flex-col gap-5">
              <a
                href="mailto:comercial@trafficclicks.com.br"
                className="group inline-flex items-center gap-4 text-lg font-semibold hover:text-orange transition-colors"
              >
                <span className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-orange transition-colors">
                  <Mail className="w-5 h-5" />
                </span>
                comercial@trafficclicks.com.br
              </a>

              <div className="inline-flex items-center gap-4 text-lg font-semibold">
                <span className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </span>
                <span>
                  1504 Sul Alameda 10, QD 17, Lote 06
                  <span className="block text-sm text-white/50 font-normal">Palmas - TO</span>
                </span>
              </div>
            </div>
          </div>

          {/* Mini contact form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.target);
              const body = `Olá! Quero alugar um brinquedo.%0A%0ANome: ${data.get(
                "nome"
              )}%0AData do evento: ${data.get("data")}%0AMensagem: ${data.get("msg")}`;
              window.location.href = `mailto:comercial@trafficclicks.com.br?subject=Reserva de brinquedo&body=${body}`;
            }}
            className="rounded-[2rem] bg-white/5 border border-white/10 p-8 flex flex-col gap-4"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                name="nome"
                required
                placeholder="Seu nome"
                className="h-12 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <input
                name="data"
                type="date"
                required
                className="h-12 px-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
            <textarea
              name="msg"
              rows={4}
              placeholder="Qual brinquedo você quer? Quantas crianças?"
              className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal resize-none"
            />
            <button
              type="submit"
              className="h-14 px-8 inline-flex items-center justify-center gap-2 rounded-full bg-orange text-white font-bold shadow-xl shadow-orange/30 hover:scale-[1.02] transition-transform"
            >
              Enviar reserva <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-orange flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </span>
            <span className="font-heading text-lg">
              Brincaê<span className="text-orange">Fest</span>
            </span>
          </div>
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Brincaê Fest. Aluguel de brinquedos infláveis. Palmas - TO.
          </p>
        </div>
      </div>
    </footer>
  );
}