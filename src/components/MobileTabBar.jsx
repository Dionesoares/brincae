import React, { useEffect, useState } from "react";
import { Home, PartyPopper, HelpCircle, MessageCircle } from "lucide-react";
import { getWhatsAppLink } from "@/lib/whatsapp";

const SECTIONS = ["brinquedos", "como-funciona"];

const TABS = [
  { id: "inicio", label: "Início", icon: Home },
  { id: "brinquedos", label: "Brinquedos", icon: PartyPopper, href: "#brinquedos" },
  { id: "como-funciona", label: "Como Funciona", icon: HelpCircle, href: "#como-funciona" },
];

/**
 * Fixed bottom navigation shown only on phones/tablets (lg:hidden) — the
 * primary way to move around the homepage there, replacing the old
 * hamburger drawer. Desktop keeps the classic top nav in Navbar.jsx.
 */
export default function MobileTabBar() {
  const [active, setActive] = useState("inicio");

  useEffect(() => {
    const onScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight * 0.35;
      let current = "inicio";
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-border shadow-[0_-8px_30px_-12px_rgba(10,17,40,0.15)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegação principal"
    >
      <div className="flex items-end justify-around px-2 h-[4.5rem]">
        <TabButton tab={TABS[0]} isActive={active === TABS[0].id} onClick={scrollToTop} />
        <TabButton tab={TABS[1]} isActive={active === TABS[1].id} />

        {/* Raised primary action, lifted above the bar like a native app's
            central call-to-action. */}
        <a
          href={getWhatsAppLink("Olá! Quero saber mais sobre os brinquedos infláveis Brincaê Fest.")}
          target="_blank"
          rel="noopener noreferrer"
          className="relative -top-5 w-14 h-14 shrink-0 rounded-full bg-orange text-white flex items-center justify-center shadow-xl shadow-orange/40 active:scale-95 transition-transform"
          aria-label="Falar no WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>

        <TabButton tab={TABS[2]} isActive={active === TABS[2].id} />
      </div>
    </nav>
  );
}

function TabButton({ tab, isActive, onClick }) {
  const className = `flex flex-col items-center justify-center gap-1 flex-1 h-16 text-[11px] font-semibold transition-colors active:scale-95 ${
    isActive ? "text-orange" : "text-cobalt/50"
  }`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <tab.icon className="w-5 h-5" />
        {tab.label}
      </button>
    );
  }

  return (
    <a href={tab.href} className={className}>
      <tab.icon className="w-5 h-5" />
      {tab.label}
    </a>
  );
}
