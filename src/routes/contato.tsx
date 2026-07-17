import { createFileRoute } from "@tanstack/react-router";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { InstagramIcon as Instagram } from "@/components/site/InstagramIcon";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_DISPLAY, waQuickBooking } from "@/lib/whatsapp";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      {
        title: "Contato — Rolezin Frontin Off Road",
      },
      {
        name: "description",
        content:
          "Fale com a Rolezin Frontin Off Road pelo WhatsApp, Instagram ou telefone. Estamos em Engenheiro Paulo de Frontin - RJ.",
      },
      {
        property: "og:title",
        content: "Contato | Rolezin Frontin Off Road",
      },
      {
        property: "og:description",
        content: "Reserve seu passeio Off Road em Engenheiro Paulo de Frontin.",
      },
      {
        property: "og:type",
        content: "website",
      },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <div className="relative overflow-hidden pt-32 pb-24">
      {/* Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-32 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
      </div>

      <div className="container-x">
        <span className="eyebrow mb-4">Contato</span>

        <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
          Bora <span className="text-brand">conversar?</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80">
          Quer reservar um passeio Off Road ou tirar alguma dúvida? Nossa equipe responde rapidamente pelo WhatsApp e
          está pronta para ajudar você a viver uma experiência inesquecível em Engenheiro Paulo de Frontin.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* WhatsApp */}

          <a
            href={waQuickBooking()}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:border-brand hover:shadow-2xl"
          >
            <MessageCircle className="h-8 w-8 text-green-500" strokeWidth={1.5} />

            <h3 className="mt-4 font-display text-2xl uppercase">WhatsApp</h3>

            <p className="mt-2 text-sm text-muted-foreground">{WHATSAPP_DISPLAY}</p>

            <p className="mt-3 text-xs font-mono uppercase tracking-widest text-brand group-hover:underline">
              Chamar agora →
            </p>
          </a>

          {/* Instagram */}

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:border-brand hover:shadow-2xl"
          >
            <Instagram className="h-8 w-8 text-pink-500" strokeWidth={1.5} />

            <h3 className="mt-4 font-display text-2xl uppercase">Instagram</h3>

            <p className="mt-2 text-sm text-muted-foreground">{INSTAGRAM_HANDLE}</p>

            <p className="mt-3 text-xs font-mono uppercase tracking-widest text-brand group-hover:underline">
              Ver perfil →
            </p>
          </a>

          {/* Telefone */}

          <a
            href={`tel:${WHATSAPP_DISPLAY.replace(/\D/g, "")}`}
            className="group rounded-2xl border border-border/60 bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:border-brand hover:shadow-2xl"
          >
            <Phone className="h-8 w-8 text-blue-500" strokeWidth={1.5} />

            <h3 className="mt-4 font-display text-2xl uppercase">Telefone</h3>

            <p className="mt-2 text-sm text-muted-foreground">{WHATSAPP_DISPLAY}</p>

            <p className="mt-3 text-xs font-mono uppercase tracking-widest text-brand group-hover:underline">
              Ligar agora →
            </p>
          </a>
        </div>

        {/* MAPA */}

        <div className="mt-14 rounded-3xl border border-border/60 bg-card p-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand" />

            <h2 className="font-display text-2xl uppercase">Onde estamos</h2>
          </div>

          <p className="mt-3 text-foreground/80">
            Sede Rolezin Frontin Off Road em
            <strong> Engenheiro Paulo de Frontin - RJ.</strong>
          </p>

          <p className="mt-2 text-sm text-muted-foreground">Venha nos conhecer!</p>

          <a
            href="https://maps.app.goo.gl/LKBFpXqpTHYULb5D9"
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 block overflow-hidden rounded-2xl border border-border transition-all hover:shadow-2xl"
          >
            <iframe
              title="Rolezin Frontin Off Road"
              src="https://www.google.com/maps/embed?pb=!4v1784288406852!6m8!1m7!1sVBAKyLVyThl4ZKduY1lahQ!2m2!1d-22.55005282223533!2d-43.67771795362831!3f303.30176945756375!4f-2.1092660268339642!5f0.7820865974627469"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              className="pointer-events-none h-[450px] w-full"
              style={{ border: 0 }}
            />
          </a>

          <a
            href="https://maps.app.goo.gl/LKBFpXqpTHYULb5D9"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white transition-all duration-300 hover:scale-105"
          >
            <MapPin className="h-5 w-5" />
            Abrir no Google Maps
          </a>
        </div>

        {/* CTA */}

        <div className="mt-24 text-center">
          <h2 className="font-display text-5xl uppercase">Pronto para acelerar?</h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-foreground/70">
            Escolha seu veículo, reserve seu passeio e venha viver uma aventura inesquecível pelas trilhas de Engenheiro
            Paulo de Frontin.
          </p>

          <a
            href={waQuickBooking()}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-brand px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="h-5 w-5" />
            Reservar pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
