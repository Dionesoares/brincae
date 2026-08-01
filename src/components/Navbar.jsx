import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Wind } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
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
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-10 h-10 rounded-2xl bg-orange flex items-center justify-center text-white shadow-lg shadow-orange/30 group-hover:scale-110 transition-transform">
            <Wind className="w-5 h-5" />
          </span>
          <span className="font-heading text-xl text-cobalt leading-none">
            Brincaê<span className="text-orange">Fest</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
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

        <button
          className="md:hidden w-12 h-12 rounded-2xl bg-cloud flex items-center justify-center text-cobalt shadow-md"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-cloud border-t border-border px-6 py-6 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-base font-semibold text-cobalt/80 py-2"
            >
              {l.label}
            </a>
          ))}
          <Link to="/admin" onClick={() => setOpen(false)} className="text-base font-semibold text-cobalt/50 py-2">
            Painel Admin
          </Link>
          <a
            href="#contato"
            onClick={() => setOpen(false)}
            className="h-12 px-6 inline-flex items-center justify-center rounded-full bg-orange text-white font-bold text-sm"
          >
            Reserve Agora
          </a>
        </div>
      )}
    </header>
  );
}