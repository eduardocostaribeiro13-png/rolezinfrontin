import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Clock, Mountain, Ruler, Users, MapPin, Sparkles } from "lucide-react";
import { ExperienceService } from "@/lib/services/experience-service";
import type { Experience, ExperienceVideoEntry } from "@/lib/experiences";
import { brlCents, collectExperienceVideos } from "@/lib/experiences";

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

  return (
    <div className="min-h-dvh bg-background">
      {/* PLAYER */}
      <section className="relative w-full bg-black">
        <div className="container-x pt-24 pb-6">
          <Link
            to="/experiencias/$slug"
            params={{ slug: exp.slug }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur-md hover:border-brand"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {exp.name}
          </Link>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-black">
            <video
              key={video.key}
              src={video.url}
              poster={exp.horizontal_image_url ?? exp.cover_image_url ?? undefined}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="auto"
              className="aspect-video w-full object-cover"
            />
          </div>

          <div className="mt-6">
            {exp.category && (
              <span className="font-mono text-xs uppercase tracking-[0.35em] text-brand">
                {exp.category.name}
              </span>
            )}
            <h1 className="mt-2 font-display text-4xl uppercase leading-[0.95] tracking-wide text-white sm:text-5xl">
              {video.title}
            </h1>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-white/60">
              {exp.name} · {exp.level}
            </p>
            {exp.short_description && (
              <p className="mt-4 max-w-3xl text-base text-white/80">{exp.short_description}</p>
            )}
          </div>
        </div>
      </section>

      {/* INFORMATIVOS */}
      <section className="container-x -mt-4 relative z-10">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-2xl md:p-6">
          <div className="grid gap-4 md:grid-cols-5 md:items-center">
            <Stat icon={<Clock />} label="Duração" value={`${exp.duration_hours}h`} />
            <Stat icon={<Ruler />} label="Distância" value={`${exp.distance_km} km`} />
            <Stat icon={<Mountain />} label="Altitude" value={`${exp.altitude_m} m`} />
            <Stat icon={<Users />} label="Máx." value={`${exp.max_people}p`} />
            <div className="flex items-center justify-between rounded-xl bg-brand/10 p-4 md:justify-end md:gap-4">
              {exp.price_cents > 0 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    A partir de
                  </p>
                  <p className="font-display text-2xl text-brand">{brlCents(exp.price_cents)}</p>
                </div>
              )}
              <Link
                to="/reservar"
                search={exp.tour_slug ? { tour: exp.tour_slug } : {}}
                className="btn-brand text-xs"
              >
                Reservar Agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CONTEÚDO DO DASHBOARD */}
      <section className="container-x grid gap-10 py-12 md:grid-cols-3 md:gap-12 md:py-16">
        <div className="space-y-10 md:col-span-2">
          {exp.description && (
            <Block title="Sobre a trilha">
              <p className="whitespace-pre-line leading-relaxed text-foreground/80">{exp.description}</p>
            </Block>
          )}

          {videos.length > 1 && (
            <Block title="Outros vídeos">
              <div className="grid gap-4 sm:grid-cols-2">
                {videos
                  .filter((v) => v.key !== video.key)
                  .map((v) => (
                    <VideoLinkCard key={v.key} slug={exp.slug} video={v} poster={exp.cover_image_url} />
                  ))}
              </div>
            </Block>
          )}

          {exp.points_of_interest.length > 0 && (
            <Block title="Pontos turísticos">
              <ul className="space-y-3">
                {exp.points_of_interest.map((p, i) => (
                  <li key={i} className="flex gap-3 rounded-xl border border-border/60 bg-card p-4">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <div>
                      <p className="font-display text-lg uppercase tracking-wide">{p.name}</p>
                      {p.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {exp.curiosities.length > 0 && (
            <Block title="Curiosidades">
              <ul className="space-y-3">
                {exp.curiosities.map((c, i) => (
                  <li key={i} className="flex gap-3 rounded-xl border border-brand/30 bg-brand/5 p-4">
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                    <p className="text-sm leading-relaxed text-foreground/90">{c}</p>
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {exp.gallery.length > 0 && (
            <Block title="Galeria">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {exp.gallery.map((g) => (
                  <img
                    key={g.id}
                    src={g.url}
                    alt={g.caption ?? exp.name}
                    loading="lazy"
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </Block>
          )}

          {exp.route_map_url && (
            <Block title="Mapa da rota">
              <img
                src={exp.route_map_url}
                alt={`Mapa — ${exp.name}`}
                className="w-full rounded-xl border border-border/60"
              />
            </Block>
          )}
        </div>

        <aside className="space-y-8">
          <SideBlock title="Equipamentos inclusos" items={exp.equipment} />
          <SideBlock title="O que levar" items={exp.what_to_bring} />
          {exp.tags.length > 0 && (
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {exp.tags.map((t) => (
                  <span key={t} className="rounded-full border border-border/60 px-3 py-1 text-xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

function VideoLinkCard({
  slug,
  video,
  poster,
}: {
  slug: string;
  video: ExperienceVideoEntry;
  poster: string | null;
}) {
  return (
    <Link
      to="/experiencias/$slug/video/$videoKey"
      params={{ slug, videoKey: video.key }}
      target="_blank"
      rel="noopener noreferrer"
      className="group overflow-hidden rounded-xl border border-border/60 bg-card transition hover:border-brand"
    >
      {poster && (
        <img
          src={poster}
          alt={video.title}
          loading="lazy"
          className="aspect-video w-full object-cover opacity-80 transition group-hover:opacity-100"
        />
      )}
      <div className="px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-brand">{video.title}</p>
      </div>
    </Link>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-4">
      <span className="text-brand [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="font-display text-xl leading-none">{value}</p>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-display text-3xl uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

function SideBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
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
