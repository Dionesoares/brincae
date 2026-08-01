import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UploadCloud, Loader2, X } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";

const EMPTY = {
  image_url: "",
  alt_text: "",
  link_url: "",
  position: 0,
  active: true,
};

export default function BannerForm({ initial, nextPosition = 0, onSaved, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({ ...EMPTY, ...initial });
    } else {
      setForm({ ...EMPTY, position: nextPosition });
    }
  }, [initial, nextPosition]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("banners")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("banners").getPublicUrl(path);
      set("image_url", data.publicUrl);
    } catch (err) {
      alert("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.image_url) {
      alert("Envie uma imagem para o banner.");
      return;
    }
    if (!form.alt_text?.trim()) {
      alert("O texto alternativo (acessibilidade) é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      const { id, ...rest } = form;
      const payload = {
        ...rest,
        link_url: form.link_url?.trim() || null,
        position: Number(form.position) || 0,
        active: !!form.active,
      };
      const { error } = id
        ? await supabase.from("banners").update(payload).eq("id", id)
        : await supabase.from("banners").insert(payload);
      if (error) throw error;
      onSaved?.();
    } catch (err) {
      alert("Erro ao salvar banner. Verifique os campos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div>
        <label className="block text-sm font-bold text-white/80 mb-2">Imagem do banner</label>
        <div className="rounded-3xl border-2 border-dashed border-white/15 bg-white/5 p-6 flex flex-col items-center justify-center gap-4">
          {form.image_url ? (
            <div className="relative w-full">
              <UIImage src={form.image_url} alt="Pré-visualização" fittingType="fill" className="w-full aspect-[3/1] rounded-2xl" />
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
              <span className="text-xs text-white/40">Recomendado: imagem larga (ex: 1600x550px)</span>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          )}
        </div>
      </div>

      <Field
        label="Texto alternativo (acessibilidade)"
        required
        value={form.alt_text}
        onChange={(v) => set("alt_text", v)}
        placeholder="Ex: Promoção de verão - 20% de desconto"
      />

      <Field
        label="Link ao clicar (opcional)"
        value={form.link_url}
        onChange={(v) => set("link_url", v)}
        placeholder="https://wa.me/... ou /brinquedo/..."
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label="Ordem de exibição"
          type="number"
          value={form.position}
          onChange={(v) => set("position", v)}
        />
        <label className="flex items-center gap-3 h-12 self-end cursor-pointer">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="w-5 h-5 rounded accent-orange"
          />
          <span className="text-sm font-semibold text-white/80">Ativo (visível no site)</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="h-12 flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-orange text-white font-bold shadow-lg shadow-orange/30 hover:scale-[1.01] transition-transform disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {form.id ? "Salvar alterações" : "Cadastrar banner"}
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
