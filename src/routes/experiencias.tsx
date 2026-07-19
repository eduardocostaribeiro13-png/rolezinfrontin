import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExperienceService, type SortKey } from "@/lib/services/experience-service";
import { HeroExperience } from "@/components/experiences/HeroExperience";
import { FeaturedSidebar } from "@/components/experiences/FeaturedSidebar";
import { ExperienceSearch } from "@/components/experiences/ExperienceSearch";
import { ExperienceCategories } from "@/components/experiences/ExperienceCategories";
import { ExperienceGrid } from "@/components/experiences/ExperienceGrid";

export const Route = createFileRoute("/experiencias")({
  head: () => ({
    meta: [
      { title: "Centro de Experiências Off-Road — Rolezin Frontin" },
      {
        name: "description",
        content:
          "Explore trilhas, cachoeiras e mirantes de Engenheiro Paulo de Frontin em vídeos imersivos e reserve sua experiência.",
      },
      { property: "og:title", content: "Centro de Experiências Off-Road — Rolezin Frontin" },
      {
        property: "og:description",
        content: "Vídeos reais das trilhas mais icônicas de Frontin. Escolha, assista e reserve.",
      },
    ],
    links: [{ rel: "canonical", href: "/experiencias" }],
  }),
  component: ExperienciasPage,
});

function ExperienciasPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("recent");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);

  const { data: cats = [] } = useQuery({
    queryKey: ["exp", "categories"],
    queryFn: () => ExperienceService.listCategories(),
    staleTime: 60_000,
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ["exp", "list", { sort, categorySlug }],
    queryFn: () =>
      ExperienceService.listPublished({
        sort,
        filters: { categorySlug: categorySlug ?? undefined },
      }),
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.short_description?.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [data, query]);

  const featured = data[0] ?? null;
  const sidePicks = useMemo(() => data.slice(1, 4), [data]);

  const clearFilters = () => {
    setQuery("");
    setCategorySlug(null);
  };

  return (
    <div className="min-h-dvh bg-[#050505] text-white">
      {/* HERO */}
      <section className="px-4 pt-24 pb-10 md:px-8 lg:px-10">
        <div className="grid gap-[18px] lg:grid-cols-[72fr_28fr]">
          <HeroExperience exp={featured} isLoading={isLoading} />
          <FeaturedSidebar items={sidePicks} isLoading={isLoading} />
        </div>
      </section>

      {/* SEARCH */}
      <section id="trilhas" className="px-4 md:px-8 lg:px-10">
        <ExperienceSearch
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
        />
      </section>

      {/* CATEGORIES */}
      <section className="px-4 pt-10 md:px-8 lg:px-10">
        <ExperienceCategories
          categories={cats}
          activeSlug={categorySlug}
          onChange={setCategorySlug}
        />
      </section>

      {/* GRID */}
      <section className="px-4 py-10 md:px-8 md:py-14 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <ExperienceGrid
            items={filtered}
            isLoading={isLoading}
            hasQuery={Boolean(query.trim()) || Boolean(categorySlug)}
            onClearFilters={clearFilters}
          />
        </div>
      </section>
    </div>
  );
}
