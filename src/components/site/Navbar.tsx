import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { waQuickBooking } from "@/lib/whatsapp";
import logo from "@/assets/logo.png";

const links = [
  { to: "/", label: "Início" },
  { to: "/passeios", label: "Passeios" },
  { to: "/galeria", label: "Galeria" },
  { to: "/tour-virtual", label: "Tour Virtual" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? "bg-background/85 backdrop-blur-xl border-b border-border/60" : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-6 md:h-20 lg:gap-10">
        <Link to="/" className="flex items-center gap-4 group shrink-0" aria-label="Rolezin Frontin Off Road — início">
          <img
            src={logo}
            alt="Rolezin Frontin Off Road"
            className="h-11 w-11 md:h-12 md:w-12 object-contain shrink-0"
          />
          <span className="hidden sm:flex lg:hidden xl:flex flex-col items-start justify-center leading-none">
            <span className="font-display text-lg tracking-widest whitespace-nowrap">ROLEZIN FRONTIN</span>
            <span className="mt-[8px] font-display text-[13px] tracking-[0.28em] text-brand whitespace-nowrap">
              OFF ROAD
            </span>
            <span className="mt-[12px] font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60 whitespace-nowrap"></span>
          </span>
        </Link>

        <nav className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-8 flex-nowrap">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium uppercase tracking-wider text-foreground/80 hover:text-brand transition-colors whitespace-nowrap"
              activeProps={{ className: "text-brand" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link to="/reservar" className="btn-brand text-xs whitespace-nowrap">
            Reservar Agora
          </Link>
        </div>

        <button
          className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground -mr-2 active:scale-95 transition-transform shrink-0"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={`lg:hidden overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-out ${
          open ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ paddingBottom: open ? "env(safe-area-inset-bottom, 0px)" : 0 }}
      >
        <div className="container-x py-5 flex flex-col">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="py-3 text-lg font-display tracking-widest text-foreground/90 border-b border-border/40 last:border-b-0"
              activeProps={{ className: "text-brand" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-4">
            <Link to="/reservar" className="btn-brand">
              Reservar Agora
            </Link>
            <a href={waQuickBooking()} target="_blank" rel="noreferrer" className="btn-outline-brand">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
