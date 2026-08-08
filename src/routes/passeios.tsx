import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExperienceService } from "@/lib/services/experience-service";
import { ExperienceCard } from "@/components/experiences/ExperienceCard";
import { Skeleton } from "@/components/ui/skeleton";

const LEVELS = ["Todos", "Leve", "Intermediário", "Radical"] as const;

export const Route = createFileRoute("/passeios")({
  head: () => ({
    meta: [
      { title: "Passeios de Quadriciclo e UTV — Rolezin Frontin Off Road" },
      { name: "description", content: "Conheça todos os passeios de quadriciclo e UTV disponíveis em Engenheiro Paulo de Frontin, RJ. Trilhas, cachoeiras, pôr do sol e mais." },
      { property: "og:title", content: "Passeios de Quadriciclo — Frontin Off Road" },
    ],
    links: [{ rel: "canonical", href: "/passeios" }],
  }),
  component: PasseiosPage,
});

function PasseiosPage() {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("Todos");
  const { data: experiences, isLoading: loadingExp } = useQuery({
    queryKey: ["exp", "list", "passeios"],
    queryFn: () => ExperienceService.listPublished({ sort: "recent" }),
    staleTime: 60_000,
  });
  const expList = (experiences ?? []).filter((e) => level === "Todos" || e.level === level);


  return (
    <div className="pt-32 pb-24">
      <div className="container-x">
        <span className="eyebrow mb-4">Passeios</span>
        <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
          Escolha sua <span className="text-brand">próxima trilha.</span>
        </h1>
        <p className="mt-6 max-w-xl text-foreground/80">
          Cada passeio foi desenhado por quem conhece cada curva das serras de Frontin. Escolha o nível de
          aventura ideal para você.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest border transition-colors ${
                level === l
                  ? "bg-brand text-brand-foreground border-brand"
                  : "border-border/60 text-foreground/80 hover:border-brand/60"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {loadingExp ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : expList.length > 0 ? (
          <div className="mt-10">
            <span className="eyebrow mb-4 block">Experiências</span>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {expList.map((e, i) => (
                <ExperienceCard key={e.id} exp={e} index={i} />
              ))}
            </div>
          </div>
        ) : null}




      </div>
    </div>
  );
}
