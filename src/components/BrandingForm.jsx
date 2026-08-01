import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { UploadCloud, Loader2, RotateCcw, Save } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";
import { useSiteSettings, DEFAULT_LOGO_URL, DEFAULT_HERO_IMAGE_URL } from "@/hooks/useSiteSettings";

export default function BrandingForm() {
  const qc = useQueryClient();
  const { logoUrl, heroImageUrl, isLoading } = useSiteSettings();
  const [logo, setLogo] = useState(logoUrl);
  const [hero, setHero] = useState(heroImageUrl);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setLogo(logoUrl);
      setHero(heroImageUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const uploadImage = async (file, setUploading, setUrl) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("branding")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("branding").getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch (err) {
      alert("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ logo_url: logo || null, hero_image_url: hero || null, updated_at: new Date().toISOString() })
        .eq("id", true);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["site-settings"] });
      alert("Identidade visual atualizada com sucesso!");
    } catch (err) {
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="font-heading text-2xl mb-1">Identidade visual</h2>
        <p className="text-white/50 text-sm">
          Troque a logomarca (cabeçalho, rodapé e este painel) e a imagem de destaque da página inicial sem
          precisar mexer no código.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <BrandImageField
          label="Logomarca"
          hint="Aparece no cabeçalho, rodapé e painel admin. Recomendado: PNG quadrado com fundo transparente."
          value={logo}
          defaultValue={DEFAULT_LOGO_URL}
          uploading={uploadingLogo}
          onUpload={(file) => uploadImage(file, setUploadingLogo, setLogo)}
          onReset={() => setLogo(DEFAULT_LOGO_URL)}
        />

        <BrandImageField
          label="Imagem de destaque da página inicial"
          hint="Aparece ao lado do texto de destaque, logo abaixo do cabeçalho. Recomendado: imagem quadrada em alta resolução."
          value={hero}
          defaultValue={DEFAULT_HERO_IMAGE_URL}
          uploading={uploadingHero}
          onUpload={(file) => uploadImage(file, setUploadingHero, setHero)}
          onReset={() => setHero(DEFAULT_HERO_IMAGE_URL)}
        />

        <div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || uploadingLogo || uploadingHero}
            className="h-12 px-8 inline-flex items-center justify-center gap-2 rounded-full bg-orange text-white font-bold shadow-lg shadow-orange/30 hover:scale-[1.02] transition-transform disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  );
}

function BrandImageField({ label, hint, value, defaultValue, uploading, onUpload, onReset }) {
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-bold text-white/80 mb-2">{label}</label>
      <div className="rounded-3xl border-2 border-dashed border-white/15 bg-white/5 p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-32 h-32 shrink-0 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center p-2">
          {value ? (
            <UIImage src={value} alt={label} fittingType="fit" className="w-full h-full object-contain" />
          ) : (
            <span className="text-white/20 text-xs text-center px-2">Sem imagem</span>
          )}
        </div>
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <p className="text-xs text-white/40">{hint}</p>
          <div className="flex flex-wrap gap-3">
            <label className="cursor-pointer inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white/10 hover:bg-white/15 transition-colors text-sm font-bold">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {uploading ? "Enviando..." : "Enviar nova imagem"}
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
            </label>
            {value !== defaultValue && (
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-sm font-semibold text-white/60"
              >
                <RotateCcw className="w-4 h-4" /> Restaurar padrão
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
