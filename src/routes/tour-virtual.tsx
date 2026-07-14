import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

const TourVirtualExperience = lazy(() =>
  import("@/components/tour/TourVirtualExperience").then((m) => ({
    default: m.TourVirtualExperience,
  })),
);

export const Route = createFileRoute("/tour-virtual")({
  ssr: false,
  head: () => ({
    meta: [
      {
        title:
          "Tour Virtual 3D — Explore as trilhas antes do passeio | Rolezin Frontin Off Road",
      },
      {
        name: "description",
        content:
          "Experiência imersiva 3D das trilhas off road em Engenheiro Paulo de Frontin. Escolha o veículo, o percurso e viva a aventura antes mesmo de chegar.",
      },
      {
        property: "og:title",
        content: "Tour Virtual 3D — Rolezin Frontin Off Road",
      },
      {
        property: "og:description",
        content:
          "Explore trilhas off road em 3D imersivo. Quadriciclo, UTV e paisagens da serra do RJ em uma experiência premium.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://rolezinfrontin.lovable.app/tour-virtual" },
    ],
    links: [{ rel: "canonical", href: "https://rolezinfrontin.lovable.app/tour-virtual" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TouristAttraction",
          name: "Tour Virtual 3D — Rolezin Frontin Off Road",
          description:
            "Experiência imersiva 3D das trilhas off road em Engenheiro Paulo de Frontin.",
          url: "https://rolezinfrontin.lovable.app/tour-virtual",
        }),
      },
    ],
  }),
  component: TourVirtualPage,
});

function TourVirtualPage() {
  return (
    <div className="min-h-dvh bg-background">
      <ClientOnly fallback={<Fallback />}>
        <Suspense fallback={<Fallback />}>
          <TourVirtualExperience />
        </Suspense>
      </ClientOnly>
    </div>
  );
}

function Fallback() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="font-mono text-xs uppercase tracking-[0.3em]">
          Carregando experiência
        </p>
      </div>
    </div>
  );
}
