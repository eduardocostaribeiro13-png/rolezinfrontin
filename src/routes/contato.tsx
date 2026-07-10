import { createFileRoute } from "@tanstack/react-router";
import { Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_DISPLAY, waQuickBooking } from "@/lib/whatsapp";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Rolezin Frontin Off Road" },
      { name: "description", content: "Fale com a Rolezin Frontin Off Road pelo WhatsApp, Instagram ou telefone. Estamos em Engenheiro Paulo de Frontin, RJ." },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container-x">
        <span className="eyebrow mb-4">Contato</span>
        <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
          Bora <span className="text-brand">conversar?</span>
        </h1>
        <p className="mt-6 max-w-xl text-foreground/80">
          O jeito mais rápido de reservar ou tirar dúvidas é chamando no WhatsApp. Respondemos rapidinho.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <a
            href={waQuickBooking()}
            target="_blank"
            rel="noreferrer"
            className="group p-6 rounded-2xl border border-border/60 bg-card hover:border-brand/60 transition-colors"
          >
            <MessageCircle className="h-8 w-8 text-brand" strokeWidth={1.5} />
            <h3 className="mt-4 font-display text-2xl uppercase">WhatsApp</h3>
            <p className="mt-2 text-sm text-muted-foreground">{WHATSAPP_DISPLAY}</p>
            <p className="mt-3 text-xs font-mono uppercase tracking-widest text-brand group-hover:underline">
              Chamar agora →
            </p>
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="group p-6 rounded-2xl border border-border/60 bg-card hover:border-brand/60 transition-colors"
          >
            <Instagram className="h-8 w-8 text-brand" strokeWidth={1.5} />
            <h3 className="mt-4 font-display text-2xl uppercase">Instagram</h3>
            <p className="mt-2 text-sm text-muted-foreground">{INSTAGRAM_HANDLE}</p>
            <p className="mt-3 text-xs font-mono uppercase tracking-widest text-brand group-hover:underline">
              Ver perfil →
            </p>
          </a>

          <div className="p-6 rounded-2xl border border-border/60 bg-card">
            <Phone className="h-8 w-8 text-brand" strokeWidth={1.5} />
            <h3 className="mt-4 font-display text-2xl uppercase">Telefone</h3>
            <p className="mt-2 text-sm text-muted-foreground">{WHATSAPP_DISPLAY}</p>
            <p className="mt-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Seg — Dom · 8h às 20h
            </p>
          </div>
        </div>

        <div className="mt-12 p-6 rounded-2xl border border-border/60 bg-card">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand" />
            <p className="font-display text-xl uppercase">Onde estamos</p>
          </div>
          <p className="mt-2 text-foreground/80">Engenheiro Paulo de Frontin — Rio de Janeiro, Brasil</p>
          <div className="mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/60">
            <iframe
              title="Mapa Engenheiro Paulo de Frontin"
              src="https://www.google.com/maps?q=Engenheiro%20Paulo%20de%20Frontin%2C%20RJ&output=embed"
              loading="lazy"
              className="h-full w-full grayscale-[0.4]"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
