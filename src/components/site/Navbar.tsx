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
        scrolled || open
          ? "bg-background/85 backdrop-blur-xl border-b border-border/60"
          : "bg-transparent"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center gap-2 group" aria-label="Rolezin Frontin Off Road — início">
          <img src={logo} alt="Rolezin Frontin Off Road" className="h-11 w-11 md:h-12 md:w-12 object-contain" />
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-lg tracking-widest">ROLEZIN FRONTIN</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand">Off Road</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium uppercase tracking-wider text-foreground/80 hover:text-brand transition-colors"
              activeProps={{ className: "text-brand" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/reservar" className="btn-brand text-xs">
            Reservar Agora
          </Link>
        </div>

        <button
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground -mr-2 active:scale-95 transition-transform"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ease-out ${
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
            <Link to="/reservar" className="btn-brand">Reservar Agora</Link>
            <a href={waQuickBooking()} target="_blank" rel="noreferrer" className="btn-outline-brand">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
