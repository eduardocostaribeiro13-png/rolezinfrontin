import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clock,
  Mountain,
  Ruler,
  Users,
  MapPin,
  Sparkles,
  Play,
  Gauge,
  Images,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ExperienceService } from "@/lib/services/experience-service";
import type { Experience, ExperienceVideoEntry } from "@/lib/experiences";
import { brlCents, collectExperienceVideos } from "@/lib/experiences";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/experiencias/$slug/video/$videoKey")({
  loader: async ({ params, context }) => {
    const exp = (await context.queryClient.ensureQueryData({
      queryKey: ["exp", "detail", params.slug],
      queryFn: () => ExperienceService.getBySlug(params.slug),
      staleTime: 30_000,
    })) as Experience | null;
    if (!exp) throw notFound();
    const videos = collectExperienceVideos(exp);
    const video = videos.find((v) => v.key === params.videoKey);
    if (!video) throw notFound();
    return { exp, video, videos };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Vídeo não encontrado" }] };
    const { exp, video } = loaderData;
    const title = `${video.title} — ${exp.name} | Rolezin Frontin`;
    const description =
      exp.short_description || exp.seo_description || `Assista ${video.title} da trilha ${exp.name}.`;
    const image = exp.og_image_url || exp.horizontal_image_url || exp.cover_image_url || undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "video.other" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-dvh grid place-items-center p-8 text-center">
      <div>
        <p className="font-display text-4xl uppercase">Vídeo não encontrado</p>
        <Link to="/experiencias" className="mt-6 inline-flex items-center gap-2 text-brand">
          <ArrowLeft className="h-4 w-4" /> Voltar às experiências
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-dvh grid place-items-center p-8">
      <p role="alert" className="text-sm text-destructive">
        Erro: {error.message}
      </p>
    </div>
  ),
  component: VideoPage,
});

function VideoPage() {
  const { exp, video, videos } = Route.useLoaderData() as {
    exp: Experience;
    video: ExperienceVideoEntry;
    videos: ExperienceVideoEntry[];
  };
  const navigate = useNavigate();

  /** Vídeo ativo controlado localmente para trocar sem sair da página. */
  const [activeKey, setActiveKey] = useState(video.key);
  const [swapping, setSwapping] = useState(false);

  // Sincroniza quando o router muda o parâmetro (voltar/avançar do navegador).
  useEffect(() => setActiveKey(video.key), [video.key]);

  const active = videos.find((v) => v.key === activeKey) ?? video;
  const backdrop = exp.horizontal_image_url || exp.cover_image_url || exp.vertical_image_url;

  function selectVideo(key: string) {
    if (key === activeKey) return;
    setSwapping(true);
    setActiveKey(key);
    // Mantém a URL coerente sem recarregar a página.
    void navigate({
      to: "/experiencias/$slug/video/$videoKey",
      params: { slug: exp.slug, videoKey: key },
      replace: true,
    });
    window.setTimeout(() => setSwapping(false), 320);
  }

  return (
    <div className="relative min-h-dvh bg-background">
      {/* FUNDO CINEMATOGRÁFICO */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        {backdrop && (
          <img
            src={backdrop}
            alt=""
            className="h-full w-full scale-110 object-cover opacity-40 blur-3xl"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,transparent,var(--background))]" />
      </div>

      {/* BARRA SUPERIOR */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container-x grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/experiencias/$slug"
              params={{ slug: exp.slug }}
              aria-label="Voltar para a experiência"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-foreground/80 transition hover:border-brand hover:text-brand"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Voltar</span>
            </Link>
            <div className="min-w-0">
              <p className="truncate font-display text-base uppercase tracking-wide">{exp.name}</p>
              <p className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {exp.category?.name ?? "Experiência"} · {exp.level}
              </p>
            </div>
          </div>
          <Link
            to="/reservar"
            search={exp.tour_slug ? { tour: exp.tour_slug } : {}}
            className="btn-brand shrink-0 px-4 py-2 text-[11px]"
          >
            Reservar
          </Link>
        </div>
      </header>

      {/* PALCO: PLAYER + PLAYLIST */}
      <section className="container-x animate-fade-in pt-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl border border-border/60 bg-black shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] transition-all duration-300",
              swapping ? "opacity-0 blur-md" : "opacity-100 blur-0",
            )}
          >
            <video
              key={active.key}
              src={active.url}
              poster={exp.horizontal_image_url ?? exp.cover_image_url ?? undefined}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="auto"
              className="h-[52vh] w-full object-cover sm:h-[62vh] lg:h-[74vh]"
            />
            <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-brand/40 bg-black/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-brand backdrop-blur-md">
              {active.title}
            </span>
          </div>

          <Playlist videos={videos} activeKey={activeKey} onSelect={selectVideo} poster={exp.cover_image_url} />
        </div>
      </section>

      {/* CABEÇALHO DO VÍDEO + INFORMATIVOS */}
      <section className="container-x mt-8 animate-fade-in">
        <div className="glass rounded-3xl border border-border/60 p-6 shadow-2xl md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-brand">
                {exp.category?.name ?? "Rolezin Frontin"}
              </span>
              <h1 className="mt-2 font-display text-4xl uppercase leading-[0.95] tracking-wide sm:text-5xl">
                {active.title}
              </h1>
              {(exp.short_description || exp.description) && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/75">
                  {exp.short_description || exp.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Stat icon={<Clock />} label="Duração" value={`${exp.duration_hours}h`} />
              <Stat icon={<Ruler />} label="Distância" value={`${exp.distance_km} km`} />
              <Stat icon={<Mountain />} label="Altitude" value={`${exp.altitude_m} m`} />
              <Stat icon={<Users />} label="Máx." value={`${exp.max_people}p`} />
              <Stat icon={<Gauge />} label="Nível" value={exp.level} />
              {exp.price_cents > 0 && (
                <div className="rounded-2xl border border-brand/40 bg-brand/10 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    A partir de
                  </p>
                  <p className="font-display text-2xl leading-none text-brand">
                    {brlCents(exp.price_cents)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="container-x grid gap-10 py-12 md:grid-cols-3 md:gap-12 md:py-16">
        <div className="space-y-12 md:col-span-2">
          {exp.description && (
            <Block title="Sobre a trilha" icon={<Sparkles />}>
              <div className="card-premium">
                <p className="whitespace-pre-line leading-relaxed text-foreground/80">
                  {exp.description}
                </p>
              </div>
            </Block>
          )}

          {exp.points_of_interest.length > 0 && (
            <Block title="Pontos turísticos" icon={<MapPin />}>
              <div className="grid gap-3 sm:grid-cols-2">
                {exp.points_of_interest.map((p, i) => (
                  <div
                    key={i}
                    className="card-premium flex gap-3 transition duration-300 hover:-translate-y-1 hover:border-brand/50"
                  >
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <div className="min-w-0">
                      <p className="font-display text-lg uppercase tracking-wide">{p.name}</p>
                      {p.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Block>
          )}

          {exp.curiosities.length > 0 && (
            <Block title="Curiosidades" icon={<Sparkles />}>
              <ul className="space-y-3">
                {exp.curiosities.map((c, i) => (
                  <li
                    key={i}
                    className="flex gap-3 rounded-2xl border border-brand/30 bg-brand/5 p-5 transition duration-300 hover:-translate-y-1 hover:border-brand/60"
                  >
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <p className="text-sm leading-relaxed text-foreground/90">{c}</p>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {exp.gallery.length > 0 && (
            <Block title="Galeria" icon={<Images />}>
              <GalleryCarousel
                items={exp.gallery.map((g) => ({ id: g.id, url: g.url, caption: g.caption }))}
                fallbackAlt={exp.name}
              />
            </Block>
          )}

          {exp.route_map_url && (
            <Block title="Mapa da rota" icon={<MapIcon />}>
              <div className="overflow-hidden rounded-3xl border border-border/60 bg-card p-2 shadow-xl">
                <img
                  src={exp.route_map_url}
                  alt={`Mapa — ${exp.name}`}
                  loading="lazy"
                  className="w-full rounded-2xl"
                />
              </div>
            </Block>
          )}
        </div>

        <aside className="space-y-6 md:sticky md:top-24 md:self-start">
          <SideBlock title="Equipamentos inclusos" items={exp.equipment} />
          <SideBlock title="O que levar" items={exp.what_to_bring} />
          {exp.tags.length > 0 && (
            <div className="card-premium">
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-brand">Tags</p>
              <div className="flex flex-wrap gap-2">
                {exp.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          <Link
            to="/reservar"
            search={exp.tour_slug ? { tour: exp.tour_slug } : {}}
            className="btn-brand w-full justify-center text-xs"
          >
            Reservar esta experiência
          </Link>
        </aside>
      </section>
    </div>
  );
}

function Playlist({
  videos,
  activeKey,
  onSelect,
  poster,
}: {
  videos: ExperienceVideoEntry[];
  activeKey: string;
  onSelect: (key: string) => void;
  poster: string | null;
}) {
  return (
    <div className="glass flex flex-col rounded-3xl border border-border/60 p-3 lg:max-h-[74vh]">
      <p className="px-2 pb-3 pt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-brand">
        Playlist · {videos.length}
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden">
        {videos.map((v) => {
          const isActive = v.key === activeKey;
          return (
            <button
              key={v.key}
              type="button"
              onClick={() => onSelect(v.key)}
              aria-current={isActive}
              className={cn(
                "group flex w-56 shrink-0 items-center gap-3 rounded-2xl border p-2 text-left transition duration-300 lg:w-full",
                isActive
                  ? "border-brand bg-brand/10 shadow-[0_0_0_1px_var(--color-brand)]"
                  : "border-border/50 bg-card/40 hover:-translate-y-0.5 hover:border-brand/50",
              )}
            >
              <span className="relative grid h-12 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-black">
                {poster && (
                  <img
                    src={poster}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover opacity-60 transition group-hover:opacity-90"
                  />
                )}
                <Play className={cn("relative h-4 w-4", isActive ? "text-brand" : "text-white/80")} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-sm uppercase tracking-wide">
                  {v.title}
                </span>
                <span className="block font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  {isActive ? "Reproduzindo" : "Assistir"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GalleryCarousel({
  items,
  fallbackAlt,
}: {
  items: Array<{ id: string; url: string; caption: string | null }>;
  fallbackAlt: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(280, el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((g) => (
          <figure
            key={g.id}
            className="group relative w-72 shrink-0 snap-start overflow-hidden rounded-2xl border border-border/60 bg-card"
          >
            <img
              src={g.url}
              alt={g.caption ?? fallbackAlt}
              loading="lazy"
              className="h-48 w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
            {g.caption && (
              <figcaption className="absolute bottom-0 left-0 right-0 translate-y-2 p-3 font-mono text-[10px] uppercase tracking-widest text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                {g.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      <div className="mt-1 flex justify-end gap-2">
        <CarouselButton label="Anterior" onClick={() => scrollBy(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </CarouselButton>
        <CarouselButton label="Próximo" onClick={() => scrollBy(1)}>
          <ChevronRight className="h-4 w-4" />
        </CarouselButton>
      </div>
    </div>
  );
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-card/70 text-foreground/80 transition hover:border-brand hover:text-brand"
    >
      {children}
    </button>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/50 p-4 transition duration-300 hover:border-brand/50">
      <span className="text-brand [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="truncate font-display text-xl leading-none">{value}</p>
      </div>
    </div>
  );
}

function Block({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-fade-in">
      <h2 className="mb-5 flex items-center gap-3 font-display text-3xl uppercase tracking-wide">
        {icon && <span className="text-brand [&>svg]:h-6 [&>svg]:w-6">{icon}</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}

function SideBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="card-premium">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-brand">{title}</p>
      <ul className="space-y-2 text-sm text-foreground/85">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-brand">→</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
