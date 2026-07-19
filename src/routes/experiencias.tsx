import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Play,
  Clock,
  Mountain,
  ChevronRight,
  Camera,
  Video,
  Globe2,
  Film,
  MapPin,
} from "lucide-react";
import { ExperienceService, type SortKey } from "@/lib/services/experience-service";
import type { Experience } from "@/lib/experiences";
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
        filters: {
          categorySlug: categorySlug ?? undefined,
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

  const featured = data[0];
  const sidePicks = data.slice(1, 4);

  return (
    <div className="min-h-dvh bg-[#050505] text-white">
      {/* ============ HERO ============ */}
      <section className="px-4 pt-24 pb-10 md:px-8 lg:px-10">
        <div className="grid gap-[18px] lg:grid-cols-[72fr_28fr]">
          {/* MAIN HERO */}
          <FeaturedHero exp={featured} isLoading={isLoading} />

          {/* SIDE CARDS */}
          <div className="grid gap-[18px] lg:grid-rows-3">
            {isLoading || sidePicks.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[195px] animate-pulse rounded-2xl bg-white/[0.04] lg:h-auto"
                  />
                ))
              : sidePicks.map((exp, i) => <SideCard key={exp.id} exp={exp} index={i} />)}
          </div>
        </div>
      </section>

      {/* ============ SEARCH BAR ============ */}
      <section id="trilhas" className="px-4 md:px-8 lg:px-10">
        <div
          className="mx-auto flex h-[70px] w-full max-w-[1400px] items-center gap-3 rounded-[20px] border border-white/[0.08] bg-[#111] px-5 backdrop-blur-xl md:gap-4 md:px-6"
        >
          <Search className="h-5 w-5 shrink-0 text-white/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar experiências, trilhas, cachoeiras..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none md:text-[15px]"
          />
          <div className="hidden h-6 w-px bg-white/10 sm:block" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="shrink-0 cursor-pointer bg-transparent text-xs font-medium uppercase tracking-wider text-white/70 outline-none hover:text-white md:text-sm"
          >
            <option value="recent" className="bg-[#111]">Mais recentes</option>
            <option value="popular" className="bg-[#111]">Mais populares</option>
            <option value="duration_asc" className="bg-[#111]">Menor duração</option>
            <option value="duration_desc" className="bg-[#111]">Maior duração</option>
            <option value="distance_asc" className="bg-[#111]">Menor distância</option>
            <option value="distance_desc" className="bg-[#111]">Maior distância</option>
          </select>
        </div>
      </section>

      {/* ============ CATEGORY NAV ============ */}
      <section className="px-4 pt-10 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1400px] overflow-x-auto">
          <nav className="flex min-w-max items-center gap-8 border-b border-white/[0.06] md:gap-10">
            <CategoryTab
              label="Todas"
              active={!categorySlug}
              onClick={() => setCategorySlug(null)}
            />
            {cats.map((c) => (
              <CategoryTab
                key={c.id}
                label={c.name}
                active={categorySlug === c.slug}
                onClick={() => setCategorySlug(c.slug)}
              />
            ))}
          </nav>
        </div>
      </section>

      {/* ============ GRID ============ */}
      <section className="px-4 py-10 md:px-8 md:py-14 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-white/[0.04]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-dashed border-white/10 p-10 text-center">
              <Film className="mx-auto h-8 w-8 text-white/40" />
              <p className="mt-4 font-display text-2xl">Nenhuma experiência encontrada</p>
              <p className="mt-2 text-sm text-white/60">Tente ajustar sua busca.</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((exp, i) => (
                  <StreamingCard key={exp.id} exp={exp} index={i} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*                          FEATURED HERO                             */
/* ------------------------------------------------------------------ */

function FeaturedHero({ exp, isLoading }: { exp: Experience | undefined; isLoading: boolean }) {
  if (isLoading || !exp) {
    return <div className="h-[620px] animate-pulse rounded-3xl bg-white/[0.04]" />;
  }

  const bg = exp.horizontal_image_url ?? exp.cover_image_url;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-[480px] overflow-hidden rounded-3xl bg-[#0E0E0E] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] md:h-[560px] lg:h-[620px]"
    >
      {/* Background */}
      {bg && (
        <img
          src={bg}
          alt={exp.name}
          className="absolute inset-0 h-full w-full scale-[1.03] object-cover transition-transform duration-[1800ms] group-hover:scale-[1.08]"
        />
      )}
      {exp.preview_video_url && (
        <video
          src={exp.preview_video_url}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        />
      )}

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,193,7,0.12),transparent_60%)]" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-start justify-end p-8 md:p-12 lg:p-16">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#FFC107]"
        >
          Centro de Experiências
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-4 font-display uppercase leading-[0.88] tracking-[-0.01em] text-white"
          style={{
            fontSize: "clamp(2.75rem, 6.2vw, 5.6rem)",
            fontWeight: 900,
            textShadow: "0 6px 30px rgba(0,0,0,0.7)",
          }}
        >
          Off Road
          <br />
          <span className="text-[#FFC107]">Em Cinema Real</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-5 max-w-xl text-sm leading-relaxed text-[#BEBEBE] md:text-base"
        >
          Trilhas, cachoeiras e mirantes de Engenheiro Paulo de Frontin filmados com drones,
          GoPros e câmeras 360°. Escolha, assista e reserve sua próxima aventura.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-7 flex flex-wrap items-center gap-5"
        >
          <a
            href="#trilhas"
            className="inline-flex items-center gap-2 rounded-full bg-[#FFC107] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[0_15px_40px_-10px_rgba(255,193,7,0.6)] transition-all hover:scale-[1.03] hover:bg-[#FFD54F]"
          >
            Explorar trilhas <ChevronRight className="h-4 w-4" />
          </a>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium uppercase tracking-widest text-white/70">
            <IconTag icon={<Video className="h-3.5 w-3.5" />} label="Drone" />
            <IconTag icon={<Camera className="h-3.5 w-3.5" />} label="GoPro" />
            <IconTag icon={<Globe2 className="h-3.5 w-3.5" />} label="360°" />
            <IconTag icon={<Film className="h-3.5 w-3.5" />} label="Cinema" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function IconTag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#FFC107]">
      {icon}
      <span className="text-white/80">{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*                          SIDE CARDS                                */
/* ------------------------------------------------------------------ */

function SideCard({ exp, index }: { exp: Experience; index: number }) {
  const bg = exp.cover_image_url ?? exp.horizontal_image_url;
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.6 }}
      className="group relative min-h-[150px] flex-1 overflow-hidden rounded-2xl bg-[#0E0E0E] shadow-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_20px_50px_-15px_rgba(255,193,7,0.35)]"
    >
      <Link to="/experiencias/$slug" params={{ slug: exp.slug }} className="block h-full">
        {bg && (
          <img
            src={bg}
            alt={exp.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[#FFC107]/0 transition-colors duration-300 group-hover:bg-[#FFC107]/[0.08]" />

        {/* Play button */}
        <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 backdrop-blur-md transition-all duration-300 group-hover:bg-[#FFC107] group-hover:scale-110">
          <Play className="h-4 w-4 fill-white text-white transition-colors group-hover:fill-black group-hover:text-black" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end p-5">
          {exp.category && (
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FFC107]">
              {exp.category.name}
            </span>
          )}
          <h3 className="mt-1.5 font-display text-xl uppercase leading-tight tracking-wide text-white line-clamp-2">
            {exp.name}
          </h3>
          <div className="mt-2.5 flex items-center gap-3 text-[11px] font-medium text-white/70">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {exp.duration_hours}h
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span className="uppercase tracking-wider">{exp.level}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*                       CATEGORY NAV TAB                             */
/* ------------------------------------------------------------------ */

function CategoryTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative py-4 text-[13px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300",
        active ? "text-[#FFC107]" : "text-white/50 hover:text-white",
      )}
    >
      {label}
      {active && (
        <motion.span
          layoutId="cat-underline"
          className="absolute inset-x-0 -bottom-px h-[2px] bg-[#FFC107]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*                      STREAMING GRID CARD                           */
/* ------------------------------------------------------------------ */

function StreamingCard({ exp, index }: { exp: Experience; index: number }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: Math.min(index * 0.04, 0.35), duration: 0.5 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative overflow-hidden rounded-2xl bg-[#0E0E0E] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.9)]"
    >
      <Link to="/experiencias/$slug" params={{ slug: exp.slug }} className="block">
        {/* 16:9 Media */}
        <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
          {exp.cover_image_url && (
            <img
              src={exp.cover_image_url}
              alt={exp.name}
              loading="lazy"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-transform duration-700",
                hover ? "scale-110" : "scale-100",
              )}
            />
          )}
          {exp.preview_video_url && hover && (
            <video
              src={exp.preview_video_url}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          {/* Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-300",
              hover ? "opacity-100" : "opacity-80",
            )}
          />

          {exp.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-[#FFC107] px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-black shadow-lg">
              {exp.badge}
            </span>
          )}

          {/* Hover CTA */}
          <div
            className={cn(
              "absolute inset-x-4 bottom-4 flex items-center justify-center gap-2 rounded-full bg-[#FFC107] py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black transition-all duration-300",
              hover ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <Play className="h-3.5 w-3.5 fill-black" /> Assistir preview
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          {exp.category && (
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#FFC107]">
              {exp.category.name}
            </span>
          )}
          <h3 className="mt-1.5 font-display text-xl uppercase leading-tight tracking-wide text-white line-clamp-2">
            {exp.name}
          </h3>

          <div className="mt-3 flex items-center gap-3 text-[11px] font-medium text-[#BEBEBE]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#FFC107]" /> Frontin
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#FFC107]" /> {exp.duration_hours}h
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span className="inline-flex items-center gap-1">
              <Mountain className="h-3 w-3 text-[#FFC107]" /> {exp.level}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
