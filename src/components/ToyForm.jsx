import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { UploadCloud, Loader2, X } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";

const EMPTY = {
  name: "",
  description: "",
  image_url: "",
  alt_text: "",
  dimensions: "",
  capacity: "",
  age_range: "",
  space_required: "",
  energy_requirements: "",
  price: "",
  status: "disponivel",
  featured: false,
};

export default function ToyForm({ initial, onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) setForm({ ...EMPTY, ...initial, price: initial.price ?? "" });
  }, [initial]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      set("image_url", file_url);
    } catch (err) {
      alert("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.alt_text?.trim()) {
      alert("O texto alternativo (acessibilidade) é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : null,
        featured: !!form.featured,
      };
      if (form.id) {
        await base44.entities.Toy.update(form.id, payload);
      } else {
        await base44.entities.Toy.create(payload);
      }
      onSaved?.();
    } catch (err) {
      alert("Erro ao salvar brinquedo. Verifique os campos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {/* Image upload */}
      <div>
        <label className="block text-sm font-bold text-white/80 mb-2">Imagem do brinquedo</label>
        <div className="rounded-3xl border-2 border-dashed border-white/15 bg-white/5 p-6 flex flex-col items-center justify-center gap-4">
          {form.image_url ? (
            <div className="relative w-full max-w-xs">
              <UIImage src={form.image_url} alt="Pré-visualização" fittingType="fill" className="w-full aspect-[4/3] rounded-2xl" />
              <button
                type="button"
                onClick={() => set("image_url", "")}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2 py-6 text-white/50 hover:text-white transition-colors">
              {uploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-orange" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
              <span className="text-sm font-semibold">
                {uploading ? "Enviando..." : "Arraste ou clique para enviar"}
              </span>
              <span className="text-xs text-white/40">JPG, PNG ou WebP</span>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nome do brinquedo" required value={form.name} onChange={(v) => set("name", v)} />
        <Field label="Texto alternativo (acessibilidade)" required value={form.alt_text} onChange={(v) => set("alt_text", v)} placeholder="Ex: Castelo inflável laranja e azul" />
        <Field label="Dimensões" value={form.dimensions} onChange={(v) => set("dimensions", v)} placeholder="6m x 4m x 3m" />
        <Field label="Capacidade" value={form.capacity} onChange={(v) => set("capacity", v)} placeholder="8 crianças" />
        <Field label="Faixa etária" value={form.age_range} onChange={(v) => set("age_range", v)} placeholder="3 a 12 anos" />
        <Field label="Espaço mínimo" value={form.space_required} onChange={(v) => set("space_required", v)} placeholder="8m x 6m" />
        <Field label="Requisitos de energia" value={form.energy_requirements} onChange={(v) => set("energy_requirements", v)} placeholder="1 tomada 110V/220V" />
        <Field label="Valor (R$)" type="number" value={form.price} onChange={(v) => set("price", v)} placeholder="450" />
      </div>

      <div>
        <label className="block text-sm font-bold text-white/80 mb-2">Descrição</label>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal resize-none"
          placeholder="Descrição detalhada do brinquedo..."
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-white/80 mb-2">Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className="w-full h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-teal"
          >
            <option value="disponivel" className="bg-cobalt">Disponível</option>
            <option value="no_campo" className="bg-cobalt">No Campo</option>
            <option value="manutencao" className="bg-cobalt">Manutenção</option>
          </select>
        </div>
        <label className="flex items-center gap-3 h-12 self-end cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => set("featured", e.target.checked)}
            className="w-5 h-5 rounded accent-orange"
          />
          <span className="text-sm font-semibold text-white/80">Destaque na home</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="h-12 flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-orange text-white font-bold shadow-lg shadow-orange/30 hover:scale-[1.01] transition-transform disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {form.id ? "Salvar alterações" : "Cadastrar brinquedo"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-12 px-6 rounded-full bg-white/10 text-white font-bold hover:bg-white/15 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-bold text-white/80 mb-2">
        {label} {required && <span className="text-orange">*</span>}
      </label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full h-12 px-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal"
      />
    </div>
  );
}