import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "react-router-dom";
import ToyForm from "@/components/ToyForm";
import BannerForm from "@/components/BannerForm";
import BrandingForm from "@/components/BrandingForm";
import { Image as UIImage } from "@/components/ui/image";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Plus, Pencil, Trash2, X, Loader2, ExternalLink, ArrowUp, ArrowDown, ImageOff, EyeOff } from "lucide-react";

const statusMap = {
  disponivel: { label: "Disponível", cls: "bg-teal/15 text-teal" },
  no_campo: { label: "No Campo", cls: "bg-orange/15 text-orange" },
  manutencao: { label: "Manutenção", cls: "bg-red-500/20 text-red-400" },
};

const TABS = [
  { id: "toys", label: "Brinquedos" },
  { id: "banners", label: "Banners promocionais" },
  { id: "branding", label: "Marca" },
];

const NEW_LABEL = { toys: "Novo Brinquedo", banners: "Novo Banner" };

export default function Admin() {
  const { logoUrl } = useSiteSettings();
  const [tab, setTab] = useState("toys");
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-cobalt text-white dark">
      {/* Top bar */}
      <header className="border-b border-white/10 sticky top-0 z-30 bg-cobalt/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-12 h-12 rounded-2xl overflow-hidden">
              <UIImage
                src={logoUrl}
                alt="Logomarca Brincaê Infláveis"
                fittingType="fit"
                className="w-full h-full object-contain"
              />
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
            {NEW_LABEL[tab] && (
              <button
                onClick={() => setShowForm(true)}
                className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-orange text-white font-bold shadow-lg shadow-orange/30 hover:scale-105 transition-transform"
              >
                <Plus className="w-5 h-5" /> {NEW_LABEL[tab]}
              </button>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex gap-2 pb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id);
                setShowForm(false);
              }}
              className={`h-10 px-5 rounded-full text-sm font-bold transition-colors ${
                tab === t.id ? "bg-orange text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {tab === "toys" ? (
          <ToysPanel showForm={showForm} setShowForm={setShowForm} />
        ) : tab === "banners" ? (
          <BannersPanel showForm={showForm} setShowForm={setShowForm} />
        ) : (
          <BrandingForm />
        )}
      </main>
    </div>
  );
}

function ToysPanel({ showForm, setShowForm }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

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

  const openEdit = (toy) => {
    setEditing(toy);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSaved = () => {
    closeForm();
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
    <>
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
          <button onClick={() => setShowForm(true)} className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-orange text-white font-bold">
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

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] bg-cobalt-soft border border-white/10 shadow-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-cobalt-soft rounded-t-[2rem] z-10">
              <h2 className="font-heading text-xl">
                {editing ? "Editar brinquedo" : "Novo brinquedo"}
              </h2>
              <button
                onClick={closeForm}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <ToyForm
                initial={editing}
                onSaved={handleSaved}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function BannersPanel({ showForm, setShowForm }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["banners", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const openEdit = (banner) => {
    setEditing(banner);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSaved = () => {
    closeForm();
    qc.invalidateQueries({ queryKey: ["banners"] });
  };

  const handleDelete = async (banner) => {
    if (!confirm("Excluir este banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", banner.id);
    if (error) {
      alert("Erro ao excluir banner.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["banners"] });
  };

  const handleToggleActive = async (banner) => {
    const { error } = await supabase
      .from("banners")
      .update({ active: !banner.active })
      .eq("id", banner.id);
    if (error) {
      alert("Erro ao atualizar banner.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["banners"] });
  };

  const handleMove = async (banner, direction) => {
    const index = banners.findIndex((b) => b.id === banner.id);
    const swapWith = banners[index + direction];
    if (!swapWith) return;
    const { error: err1 } = await supabase
      .from("banners")
      .update({ position: swapWith.position })
      .eq("id", banner.id);
    const { error: err2 } = await supabase
      .from("banners")
      .update({ position: banner.position })
      .eq("id", swapWith.id);
    if (err1 || err2) {
      alert("Erro ao reordenar banners.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["banners"] });
  };

  const nextPosition = banners.length
    ? Math.max(...banners.map((b) => b.position ?? 0)) + 1
    : 0;

  return (
    <>
      <div className="mb-6">
        <h2 className="font-heading text-2xl mb-1">Banners promocionais</h2>
        <p className="text-white/50 text-sm">
          Aparecem em rotação logo abaixo do cabeçalho na página inicial. Use a seta para reordenar e o botão de olho para ativar/ocultar sem excluir.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange" />
        </div>
      ) : banners.length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-white/10 p-16 text-center">
          <p className="font-heading text-2xl text-white/40 mb-2">Nenhum banner cadastrado</p>
          <p className="text-white/50 mb-6">Adicione um banner promocional para exibir na home.</p>
          <button onClick={() => setShowForm(true)} className="h-12 px-6 inline-flex items-center gap-2 rounded-full bg-orange text-white font-bold">
            <Plus className="w-5 h-5" /> Cadastrar banner
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              className={`rounded-[2rem] bg-white/5 border border-white/10 overflow-hidden flex flex-col sm:flex-row gap-4 p-4 ${
                banner.active ? "" : "opacity-50"
              }`}
            >
              <div className="relative w-full sm:w-64 shrink-0 aspect-[3/1] sm:aspect-[3/1] rounded-2xl overflow-hidden bg-white/5">
                {banner.image_url ? (
                  <UIImage src={banner.image_url} alt={banner.alt_text} fittingType="fill" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <ImageOff className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                <p className="font-heading text-lg leading-tight truncate">{banner.alt_text}</p>
                {banner.link_url ? (
                  <p className="text-sm text-white/50 truncate">{banner.link_url}</p>
                ) : (
                  <p className="text-sm text-white/30">Sem link</p>
                )}
                <span
                  className={`inline-flex w-fit items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                    banner.active ? "bg-teal/15 text-teal" : "bg-white/10 text-white/50"
                  }`}
                >
                  {banner.active ? "Ativo" : "Oculto"}
                </span>
              </div>
              <div className="flex sm:flex-col items-center justify-end sm:justify-center gap-2 shrink-0">
                <div className="flex sm:flex-col gap-1">
                  <button
                    onClick={() => handleMove(banner, -1)}
                    disabled={i === 0}
                    className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(banner, 1)}
                    disabled={i === banners.length - 1}
                    className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleToggleActive(banner)}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 transition-colors"
                  title={banner.active ? "Ocultar" : "Ativar"}
                >
                  <EyeOff className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(banner)}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/15 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner)}
                  className="w-9 h-9 inline-flex items-center justify-center rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] bg-cobalt-soft border border-white/10 shadow-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-cobalt-soft rounded-t-[2rem] z-10">
              <h2 className="font-heading text-xl">
                {editing ? "Editar banner" : "Novo banner"}
              </h2>
              <button
                onClick={closeForm}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <BannerForm
                initial={editing}
                nextPosition={nextPosition}
                onSaved={handleSaved}
                onCancel={closeForm}
              />
            </div>
          </div>
        </div>
      )}
    </>
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
