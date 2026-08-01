import React, { useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import ToyCard from "@/components/ToyCard";
import { Loader2, Search } from "lucide-react";

const SIZE_FILTERS = [
  { id: "all", label: "Todos" },
  { id: "pequeno", label: "Pequeno" },
  { id: "medio", label: "Médio" },
  { id: "grande", label: "Grande" },
];

export default function ToyGallery() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const { data: toys = [], isLoading } = useQuery({
    queryKey: ["toys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("toys")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    return toys.filter((t) => {
      const matchesQuery =
        !query ||
        t.name?.toLowerCase().includes(query.toLowerCase()) ||
        t.description?.toLowerCase().includes(query.toLowerCase());
      let matchesSize = true;
      if (filter !== "all") {
        const dim = (t.dimensions || "").toLowerCase();
        if (filter === "pequeno") matchesSize = /([1-3])\s*m/.test(dim) && !/[4-9]\s*m/.test(dim.replace(/[1-3]\s*m/, ""));
        if (filter === "medio") matchesSize = /([4-6])\s*m/.test(dim);
        if (filter === "grande") matchesSize = /([7-9]|[1-9][0-9])\s*m/.test(dim);
      }
      return matchesQuery && matchesSize;
    });
  }, [toys, filter, query]);

  return (
    <section id="brinquedos" className="py-24 lg:py-32 bg-cloud">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="px-4 py-2 rounded-full bg-orange/10 text-orange text-sm font-bold mb-4">
            O Baú de Brinquedos
          </span>
          <h2 className="font-heading text-4xl sm:text-5xl text-cobalt text-balance">
            Escolha sua aventura
          </h2>
          <p className="text-cobalt/60 mt-4 max-w-xl">
            Cada inflável é uma experiência. Filtre por tamanho e encontre o brinquedo perfeito para o seu espaço.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-10">
          <div className="flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-6 px-6 sm:mx-0 sm:px-0 sm:flex-wrap w-full sm:w-auto">
            {SIZE_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`h-11 px-5 rounded-full text-sm font-bold transition-all shrink-0 snap-start active:scale-95 ${
                  filter === f.id
                    ? "bg-orange text-white shadow-lg shadow-orange/30"
                    : "bg-white text-cobalt/70 hover:bg-cobalt hover:text-white border border-border"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cobalt/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar brinquedo..."
              className="w-full h-11 pl-11 pr-4 rounded-full bg-white border border-border text-sm text-cobalt placeholder:text-cobalt/40 focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-heading text-2xl text-cobalt/40">Nenhum brinquedo encontrado</p>
            <p className="text-cobalt/50 mt-2">Tente outro filtro ou busca.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((toy, i) => (
              <ToyCard key={toy.id} toy={toy} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}