import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "react-router-dom";
import ToyForm from "@/components/ToyForm";
import { Image as UIImage } from "@/components/ui/image";
import { Plus, Pencil, Trash2, X, Loader2, ExternalLink } from "lucide-react";

const LOGO_URL =
  "https://media.base44.com/images/public/6a6df82039b71decb31cf763/5d9a7f8ae_WhatsApp_Image_2026-08-01_at_103917-removebg-preview.png";

const statusMap = {
  disponivel: { label: "Disponível", cls: "bg-teal/15 text-teal" },
  no_campo: { label: "No Campo", cls: "bg-orange/15 text-orange" },
  manutencao: { label: "Manutenção", cls: "bg-red-500/20 text-red-400" },
};

export default function Admin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { data: toys = [], isLoading } = useQuery({
    queryKey: ["toys"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("toys")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  const openNew = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (toy) => {
    setEditing(toy);
    setShowForm(true);
  };

  const handleSaved = () => {
    setShowForm(false);
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["toys"] });
  };

  const handleDelete = async (toy) => {
    if (!confirm(`Excluir "${toy.name}"?`)) return;
    const { error } = await supabase.from("toys").delete().eq("id", toy.id);
    if (error) {
      alert("Erro ao excluir brinquedo.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["toys"] });
  };

  return (
    <div className="min-h-screen bg-cobalt text-white dark">
      {/* Top bar */}
      <header className="border-b border-white/10 sticky top-0 z-30 bg-cobalt/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-12 h-12 rounded-2xl overflow-hidden">
              <UIImage src={LOGO_URL} alt="Logomarca Brincaê Infláveis" fittingType="fit" className="w-full h-full" />
            </span>
            <div>
              <p className="font-heading text-lg leading-none">
                Brincaê<span className="text-orange">Fest</span>
              </p>
              <p className="text-xs text-white/40">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-semibold text-white/60 hover:text-white transition-colors hidden sm:inline">
              Ver site
            </Link>
            <button
              onClick={openNew}
              className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-orange text-white font-bold shadow-lg shadow-orange/30 hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5" /> Novo Brinquedo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <Stat label="Total" value={toys.length} accent="pink" />
          <Stat label="Disponíveis" value={toys.filter((t) => t.status === "disponivel").length} accent="teal" />
          <Stat label="No Campo" value={toys.filter((t) => t.status === "no_campo").length} accent="orange" />
          <Stat label="Manutenção" value={toys.filter((t) => t.status === "manutencao").length} accent="red" />
        </div>

        <h2 className="font-heading text-2xl mb-6">Catálogo de brinquedos</h2>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange" />
          </div>
        ) : toys.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-white/10 p-16 text-center">
            <p className="font-heading text-2xl text-white/40 mb-2">Nenhum brinquedo cadastrado</p>
            <p className="text-white/50 mb-6">Comece adicionando seu primeiro inflável ao catálogo.</p>
            <button onClick={openNew} className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-orange text-white font-bold">
              <Plus className="w-5 h-5" /> Cadastrar brinquedo
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {toys.map((toy) => {
              const status = statusMap[toy.status] || statusMap.disponivel;
              return (
                <div
                  key={toy.id}
                  className="rounded-[2rem] bg-white/5 border border-white/10 overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[4/3] bg-white/5">
                    {toy.image_url ? (
                      <UIImage src={toy.image_url} alt={toy.alt_text || toy.name} fittingType="fill" className="w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 font-heading">Sem imagem</div>
                    )}
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div>
                      <h3 className="font-heading text-lg leading-tight">{toy.name}</h3>
                      <p className="text-sm text-white/50 mt-1 line-clamp-2">{toy.dimensions || "—"} · {toy.capacity || "—"}</p>
                    </div>
                    {toy.price ? (
                      <p className="font-heading text-xl text-orange">R$ {Number(toy.price).toLocaleString("pt-BR")}</p>
                    ) : null}
                    <div className="flex gap-2 mt-auto pt-3">
                      <Link
                        to={`/brinquedo/${toy.id}`}
                        className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 rounded-full bg-white/10 text-sm font-bold hover:bg-white/15 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" /> Ver
                      </Link>
                      <button
                        onClick={() => openEdit(toy)}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(toy)}
                        className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] bg-cobalt-soft border border-white/10 shadow-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-cobalt-soft rounded-t-[2rem] z-10">
              <h2 className="font-heading text-xl">
                {editing ? "Editar brinquedo" : "Novo brinquedo"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ToyForm
                initial={editing}
                onSaved={handleSaved}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent = "white" }) {
  const colors = {
    white: "text-white",
    teal: "text-teal",
    orange: "text-orange",
    pink: "text-pink",
    yellow: "text-yellow",
    red: "text-red-400",
  };
  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
      <p className="text-xs text-white/50 font-semibold uppercase tracking-wide">{label}</p>
      <p className={`font-heading text-3xl mt-1 ${colors[accent]}`}>{value}</p>
    </div>
  );
}