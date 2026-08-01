import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Image as UIImage } from "@/components/ui/image";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function Navbar() {
  const { logoUrl } = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Brinquedos", href: "#brinquedos" },
    { label: "Como Funciona", href: "#como-funciona" },
    { label: "Contato", href: "#contato" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-cloud/85 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(10,17,40,0.15)]" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-20 lg:h-40 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-16 h-16 lg:w-48 lg:h-48 flex items-center justify-center overflow-visible group-hover:scale-110 transition-transform">
            <UIImage
              src={logoUrl}
              alt="Logomarca Brincaê Infláveis"
              fittingType="fit"
              className="w-full h-full object-contain"
            />
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-semibold text-cobalt/70 hover:text-orange transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contato"
            className="h-12 px-6 inline-flex items-center justify-center rounded-full bg-orange text-white font-bold text-sm shadow-lg shadow-orange/30 hover:scale-105 transition-transform"
          >
            Reserve Agora
          </a>
          <Link
            to="/admin"
            className="text-sm font-semibold text-cobalt/50 hover:text-cobalt transition-colors"
          >
            Admin
          </Link>
        </div>

        {/* Mobile/tablet: primary nav lives in the bottom tab bar, keep just a
            discreet admin entry point here so it isn't lost. */}
        <Link
          to="/admin"
          aria-label="Painel administrativo"
          className="lg:hidden w-11 h-11 rounded-2xl bg-white/70 backdrop-blur flex items-center justify-center text-cobalt/60 shadow-md active:scale-95 transition-transform"
        >
          <Lock className="w-4 h-4" />
        </Link>
      </nav>
    </header>
  );
}
