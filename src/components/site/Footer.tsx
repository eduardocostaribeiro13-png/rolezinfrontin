import { Link } from "@tanstack/react-router";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/site/InstagramIcon";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_DISPLAY, waQuickBooking } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="relative border-t border-border/60 bg-[oklch(0.11_0_0)]">
      <div className="container-x py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="grid place-items-center h-10 w-10 rounded-full bg-brand text-brand-foreground font-display">
              RF
            </span>
            <span className="font-display text-xl tracking-widest">ROLEZIN FRONTIN OFF ROAD</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Passeios de quadriciclo e UTV pelas trilhas mais incríveis de Engenheiro Paulo de Frontin, RJ.
            Aventura, segurança e memórias inesquecíveis.
          </p>
          <div className="mt-6 flex gap-3">
            <a href={waQuickBooking()} target="_blank" rel="noreferrer" className="btn-brand text-xs">
              Reservar no WhatsApp
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-brand mb-4">Navegação</h4>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li><Link to="/" className="hover:text-brand">Início</Link></li>
            <li><Link to="/passeios" className="hover:text-brand">Passeios</Link></li>
            <li><Link to="/galeria" className="hover:text-brand">Galeria</Link></li>
            <li><Link to="/sobre" className="hover:text-brand">Sobre</Link></li>
            <li><Link to="/reservar" className="hover:text-brand">Reservar</Link></li>
            <li><Link to="/contato" className="hover:text-brand">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-brand mb-4">Contato</h4>
          <ul className="space-y-3 text-sm text-foreground/80">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-brand" />
              Engenheiro Paulo de Frontin — RJ
            </li>
            <li className="flex items-start gap-2">
              <Phone className="h-4 w-4 mt-0.5 text-brand" />
              {WHATSAPP_DISPLAY}
            </li>
            <li>
              <a href={waQuickBooking()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-brand">
                <MessageCircle className="h-4 w-4 text-brand" /> WhatsApp
              </a>
            </li>
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-brand">
                <Instagram className="h-4 w-4 text-brand" /> {INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 py-6">
        <div className="container-x flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Rolezin Frontin Off Road. Todos os direitos reservados.</p>
          <p className="font-mono uppercase tracking-widest">Feito com adrenalina no RJ</p>
        </div>
      </div>
    </footer>
  );
}
