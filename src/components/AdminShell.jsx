import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Image as UIImage } from "@/components/ui/image";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/lib/AuthContext";
import { Loader2, LogOut } from "lucide-react";

const NAV = [
  { id: "toys", label: "Brinquedos" },
  { id: "banners", label: "Banners promocionais" },
  { id: "branding", label: "Marca" },
  { id: "evento", label: "Evento" },
];

export default function AdminShell({ active, onTab, action, children }) {
  const { logoUrl } = useSiteSettings();
  const { logout } = useAuth();
  const location = useLocation();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  return (
    <div className="min-h-screen bg-cobalt text-white dark">
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
            {action}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sair"
              className="h-12 w-12 sm:w-auto sm:px-5 inline-flex items-center justify-center gap-2 rounded-full bg-white/10 text-white font-bold hover:bg-white/15 transition-colors disabled:opacity-50"
            >
              {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex gap-2 pb-4 overflow-x-auto">
          {NAV.map((item) => {
            const isActive = item.id === active;
            const className = `h-10 px-5 rounded-full text-sm font-bold transition-colors inline-flex items-center shrink-0 ${
              isActive ? "bg-orange text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
            }`;
            if (item.id === "evento") {
              return (
                <Link key={item.id} to="/admin/evento" className={className}>
                  {item.label}
                </Link>
              );
            }
            return (
              <Link
                key={item.id}
                to="/admin"
                state={{ tab: item.id }}
                className={className}
                onClick={(event) => {
                  if (location.pathname === "/admin") {
                    event.preventDefault();
                    onTab?.(item.id);
                  }
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {children}
      </main>
    </div>
  );
}
