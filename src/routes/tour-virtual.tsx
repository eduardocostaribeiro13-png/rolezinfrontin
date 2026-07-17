import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const TourVirtualExperience = lazy(() =>
  import("@/components/tour/TourVirtualExperience").then((m) => ({
    default: m.TourVirtualExperience,
  })),
);

export const Route = createFileRoute("/tour-virtual")({
  ssr: false,

  head: () => ({
    title: "Tour Virtual 3D | Rolezin Frontin Off Road | Explore as Trilhas Antes do Passeio",

    meta: [
      {
        name: "description",
        content:
          "Conheça as trilhas de Engenheiro Paulo de Frontin em um Tour Virtual 3D totalmente imersivo. Explore percursos de Quadriciclo e UTV antes mesmo de reservar seu passeio.",
      },

      {
        name: "keywords",
        content:
          "Tour Virtual, Tour 3D, Quadriciclo, UTV, Off Road, Engenheiro Paulo de Frontin, Turismo RJ, Rolezin Frontin Off Road, Passeio de Quadriciclo",
      },

      {
        name: "robots",
        content: "index, follow, max-image-preview:large",
      },

      {
        name: "theme-color",
        content: "#0B0B0B",
      },

      {
        property: "og:type",
        content: "website",
      },

      {
        property: "og:site_name",
        content: "Rolezin Frontin Off Road",
      },

      {
        property: "og:title",
        content: "Tour Virtual 3D | Explore as Trilhas Antes do Passeio",
      },

      {
        property: "og:description",
        content:
          "Experimente uma aventura imersiva em 3D pelas trilhas de Engenheiro Paulo de Frontin antes mesmo de realizar sua reserva.",
      },

      {
        property: "og:url",
        content: "https://rolezinfrontin.lovable.app/tour-virtual",
      },

      {
        property: "og:image",
        content: "https://rolezinfrontin.lovable.app/og-tour.jpg",
      },

      {
        property: "og:image:width",
        content: "1200",
      },

      {
        property: "og:image:height",
        content: "630",
      },

      {
        property: "og:locale",
        content: "pt_BR",
      },

      {
        name: "twitter:card",
        content: "summary_large_image",
      },

      {
        name: "twitter:title",
        content: "Tour Virtual 3D | Rolezin Frontin Off Road",
      },

      {
        name: "twitter:description",
        content: "Explore as trilhas antes do passeio em uma experiência totalmente imersiva.",
      },

      {
        name: "twitter:image",
        content: "https://rolezinfrontin.lovable.app/og-tour.jpg",
      },
    ],

    links: [
      {
        rel: "canonical",
        href: "https://rolezinfrontin.lovable.app/tour-virtual",
      },

      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "",
      },

      // Remova se não utilizar um arquivo GLB principal
      // {
      //   rel: "preload",
      //   href: "/models/frontin.glb",
      //   as: "fetch",
      //   crossOrigin: "anonymous",
      // },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TouristAttraction",

          name: "Tour Virtual 3D - Rolezin Frontin Off Road",

          description: "Experiência virtual imersiva em 3D das trilhas off road de Engenheiro Paulo de Frontin.",

          url: "https://rolezinfrontin.lovable.app/tour-virtual",

          image: "https://rolezinfrontin.lovable.app/og-tour.jpg",

          address: {
            "@type": "PostalAddress",
            addressLocality: "Engenheiro Paulo de Frontin",
            addressRegion: "RJ",
            addressCountry: "BR",
          },

          touristType: ["Aventura", "Ecoturismo", "Off Road"],

          isAccessibleForFree: true,
        }),
      },
    ],
  }),

  component: TourVirtualPage,
});

function TourVirtualPage() {
  return (
    <main className="min-h-dvh bg-background">
      <ClientOnly fallback={<Fallback />}>
        <Suspense fallback={<Fallback />}>
          <TourVirtualExperience />
        </Suspense>
      </ClientOnly>
    </main>
  );
}

function Fallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background">
      <div className="flex flex-col items-center gap-8">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-brand/20"></div>

          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand"></div>

          <div className="absolute inset-3 rounded-full bg-brand/10 blur-xl"></div>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="font-display text-2xl tracking-wide">Explorando as trilhas...</h2>

          <p className="text-sm text-muted-foreground">Preparando a experiência 3D do Rolezin Frontin Off Road</p>
        </div>
      </div>
    </div>
  );
}
