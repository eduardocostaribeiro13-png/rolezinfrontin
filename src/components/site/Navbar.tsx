import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { waQuickBooking } from "@/lib/whatsapp";

const links = [
  { to: "/", label: "Início" },
  { to: "/passeios", label: "Passeios" },
  { to: "/galeria", label: "Galeria" },
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
          <span className="grid place-items-center h-9 w-9 rounded-full bg-brand text-brand-foreground font-display text-lg leading-none">
            RF
          </span>
          <span className="flex flex-col leading-tight">
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
          className="md:hidden p-2 rounded-md text-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
          <div className="container-x py-6 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-lg font-display tracking-widest text-foreground/90"
                activeProps={{ className: "text-brand" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/reservar" className="btn-brand">Reservar Agora</Link>
              <a href={waQuickBooking()} target="_blank" rel="noreferrer" className="btn-outline-brand">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
