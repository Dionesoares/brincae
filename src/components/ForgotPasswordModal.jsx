import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, ArrowLeft, Loader2, ShieldCheck, MailCheck } from "lucide-react";

export default function ForgotPasswordModal({ onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email);
    } catch {
      // Always show generic success, regardless of whether the email exists
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cobalt">
      <div className="absolute -top-40 -right-40 w-[30rem] h-[30rem] rounded-full bg-pink/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-teal/10 blur-3xl" />

      <div className="relative w-full max-w-md rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl p-8 animate-inflate">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-teal/15 flex items-center justify-center mb-4">
            {sent ? (
              <MailCheck className="w-7 h-7 text-teal" />
            ) : (
              <Mail className="w-7 h-7 text-teal" />
            )}
          </div>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal/15 text-teal text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Recuperação de senha
          </span>
          <h1 className="font-heading text-2xl text-white">
            {sent ? "Verifique seu e-mail" : "Esqueceu sua senha?"}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {sent
              ? "Se existir uma conta com esse e-mail, você receberá um link para redefinir sua senha em instantes."
              : "Informe seu e-mail e enviaremos um link para redefinir sua senha."}
          </p>
        </div>

        {!sent && (
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
            <button
              type="submit"
              disabled={loading}
              className="h-12 mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-orange text-white font-bold shadow-lg shadow-orange/30 hover:scale-[1.01] transition-transform disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Enviar link de recuperação
            </button>
          </form>
        )}

        <button
          onClick={onBack}
          className="w-full mt-6 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
        </button>
      </div>
    </div>
  );
}