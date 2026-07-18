import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Filter, Play, MapPin, Clock, Ruler, Mountain, ChevronRight } from "lucide-react";
import { ExperienceService, type SortKey } from "@/lib/services/experience-service";
import type { Experience } from "@/lib/experiences";
import { EXPERIENCE_LEVELS } from "@/lib/experiences";
import { cn } from "@/lib/utils";

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
  const [vehicleSlug, setVehicleSlug] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  const { data: cats = [] } = useQuery({
    queryKey: ["exp", "categories"],
    queryFn: () => ExperienceService.listCategories(),
    staleTime: 60_000,
  });
  const { data: vehicles = [] } = useQuery({
    queryKey: ["exp", "vehicles"],
    queryFn: () => ExperienceService.listVehicleTypes(),
    staleTime: 60_000,
  });

  const { data = [], isLoading } = useQuery({
    queryKey: ["exp", "list", { sort, categorySlug, vehicleSlug, level }],
    queryFn: () =>
      ExperienceService.listPublished({
        sort,
        filters: {
          categorySlug: categorySlug ?? undefined,
          vehicleSlug: vehicleSlug ?? undefined,
          level: (level as never) ?? undefined,
        },
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

  return (
    <div className="min-h-dvh bg-background">
      {/* HERO */}
      <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-neutral-900" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, hsl(var(--brand)/0.35), transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--brand)/0.2), transparent 45%)",
          }}
        />
        <div className="relative z-10 container-x flex h-full flex-col items-start justify-end pb-16 pt-24">
          <span className="font-mono text-xs uppercase tracking-[0.35em] text-brand">
            Centro de Experiências
          </span>
          <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-wide text-white sm:text-6xl md:text-7xl">
            Off-Road<br />em Cinema Real
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/70 md:text-lg">
            Trilhas, cachoeiras e mirantes de Engenheiro Paulo de Frontin filmados por drones,
            GoPros e câmeras 360°. Escolha uma experiência, assista e reserve seu passeio.
          </p>
          <a
            href="#trilhas"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-mono text-xs uppercase tracking-widest text-brand-foreground transition-transform hover:scale-[1.02]"
          >
            Explorar trilhas <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* FILTROS */}
      <section id="trilhas" className="container-x -mt-8 relative z-20">
        <div className="rounded-2xl border border-border/60 bg-card/95 p-4 backdrop-blur-xl md:p-6 shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar trilha..."
                className="w-full rounded-xl border border-border/60 bg-background px-10 py-3 text-sm outline-none focus:border-brand"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-border/60 bg-background px-4 py-3 text-sm outline-none focus:border-brand"
            >
              <option value="recent">Mais recentes</option>
              <option value="popular">Mais populares</option>
              <option value="duration_asc">Menor duração</option>
              <option value="duration_desc">Maior duração</option>
              <option value="distance_asc">Menor distância</option>
              <option value="distance_desc">Maior distância</option>
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Chip active={!categorySlug && !vehicleSlug && !level} onClick={() => { setCategorySlug(null); setVehicleSlug(null); setLevel(null); }}>Todas</Chip>
            {cats.map((c) => (
              <Chip key={c.id} active={categorySlug === c.slug} onClick={() => setCategorySlug(categorySlug === c.slug ? null : c.slug)}>
                {c.name}
              </Chip>
            ))}
            <span className="mx-2 h-4 w-px bg-border/60" />
            {vehicles.map((v) => (
              <Chip key={v.id} active={vehicleSlug === v.slug} onClick={() => setVehicleSlug(vehicleSlug === v.slug ? null : v.slug)}>
                {v.name}
              </Chip>
            ))}
            <span className="mx-2 h-4 w-px bg-border/60" />
            {EXPERIENCE_LEVELS.map((l) => (
              <Chip key={l} active={level === l} onClick={() => setLevel(level === l ? null : l)}>
                {l}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="container-x py-12 md:py-16">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border/60 p-10 text-center">
            <Filter className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-4 font-display text-2xl">Nenhuma experiência encontrada</p>
            <p className="mt-2 text-sm text-muted-foreground">Tente ajustar os filtros ou a busca.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((exp, i) => (
              <ExperienceCard key={exp.id} exp={exp} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors",
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border/60 bg-transparent text-foreground/70 hover:border-brand/60 hover:text-brand",
      )}
    >
      {children}
    </button>
  );
}

function ExperienceCard({ exp, index }: { exp: Experience; index: number }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg transition-all hover:-translate-y-1 hover:border-brand/60 hover:shadow-brand/10"
    >
      <Link to="/experiencias/$slug" params={{ slug: exp.slug }} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
          {exp.cover_image_url && (
            <img
              src={exp.cover_image_url}
              alt={exp.name}
              loading="lazy"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-transform duration-700",
                hover ? "scale-105" : "scale-100",
              )}
            />
          )}
          {exp.preview_video_url && hover && (
            <video
              key={exp.id}
              src={exp.preview_video_url}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {exp.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-brand-foreground shadow-lg">
              {exp.badge}
            </span>
          )}
          <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-md transition-transform group-hover:scale-110">
            <Play className="h-4 w-4 fill-white text-white" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            {exp.category && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-brand">
                {exp.category.name}
              </span>
            )}
            <h3 className="mt-1 font-display text-2xl uppercase leading-tight tracking-wide">
              {exp.name}
            </h3>
          </div>
        </div>

        <div className="p-4">
          {exp.short_description && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{exp.short_description}</p>
          )}
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <Meta icon={<Clock className="h-3.5 w-3.5" />} label={`${exp.duration_hours}h`} />
            <Meta icon={<Ruler className="h-3.5 w-3.5" />} label={`${exp.distance_km}km`} />
            <Meta icon={<Mountain className="h-3.5 w-3.5" />} label={exp.level} />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3" />
              Frontin — RJ
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-brand">
              Entrar na experiência <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span className="text-brand">{icon}</span>
      <span className="font-mono uppercase tracking-wider">{label}</span>
    </div>
  );
}
