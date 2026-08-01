import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Lock, Mail, Loader2, ShieldCheck } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";

const LOGO_URL =
  "https://media.base44.com/images/public/6a6df82039b71decb31cf763/5d9a7f8ae_WhatsApp_Image_2026-08-01_at_103917-removebg-preview.png";

export default function AdminLoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "/admin";
    } catch (err) {
      setError(err.message || "E-mail ou senha inválidos");
      setLoading(false);
    }
  };

  if (showForgot) {
    return <ForgotPasswordModal onBack={() => setShowForgot(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cobalt">
      <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] rounded-full bg-orange/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-teal/10 blur-3xl" />

      <div className="relative w-full max-w-md rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl p-8 animate-inflate">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-32 h-32 rounded-3xl bg-white/5 flex items-center justify-center overflow-hidden mb-4 p-2">
            <UIImage
              src={LOGO_URL}
              alt="Logomarca Brincaê Infláveis"
              fittingType="fit"
              className="w-full h-full"
            />
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal/15 text-teal text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Acesso restrito
          </span>
          <h1 className="font-heading text-2xl text-white">Painel Administrativo</h1>
          <p className="text-white/50 text-sm mt-1">Entre com seu e-mail e senha para continuar</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/15 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="email"
              required
              autoFocus
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-12 mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-orange text-white font-bold shadow-lg shadow-orange/30 hover:scale-[1.01] transition-transform disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Entrar
          </button>
        </form>

        <button
          onClick={() => setShowForgot(true)}
          className="w-full mt-5 text-sm font-semibold text-white/50 hover:text-white transition-colors"
        >
          Esqueceu sua senha?
        </button>
      </div>
    </div>
  );
}