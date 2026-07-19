import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Ruler,
  Mountain,
  Users,
  Sparkles,
  MapPin,
  Play,
} from "lucide-react";
import { ExperienceService } from "@/lib/services/experience-service";
import type { Experience } from "@/lib/experiences";
import { VIDEO_KIND_LABEL, brlCents } from "@/lib/experiences";

export const Route = createFileRoute("/experiencias/$slug")({
  loader: async ({ params, context }) => {
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["exp", "detail", params.slug],
      queryFn: () => ExperienceService.getBySlug(params.slug),
      staleTime: 30_000,
    });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Experiência não encontrada" }, { name: "robots", content: "noindex" }] };
    }
    const title = loaderData.seo_title || `${loaderData.name} — Rolezin Frontin`;
    const description = loaderData.seo_description || loaderData.short_description || "Experiência off-road em Engenheiro Paulo de Frontin.";
    const image = loaderData.og_image_url || loaderData.cover_image_url || undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        ...(image ? [{ property: "og:image", content: image }, { name: "twitter:card", content: "summary_large_image" }] : []),
      ],
      links: [{ rel: "canonical", href: `/experiencias/${loaderData.slug}` }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-dvh grid place-items-center">
      <div className="text-center">
        <p className="font-display text-4xl uppercase">Experiência não encontrada</p>
        <Link to="/experiencias" className="mt-6 inline-flex items-center gap-2 text-brand">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-dvh grid place-items-center p-8">
      <p role="alert" className="text-sm text-destructive">Erro: {error.message}</p>
    </div>
  ),
  component: ExperienceDetail,
});

function ExperienceDetail() {
  const initial = Route.useLoaderData() as Experience;
  const { data } = useQuery({
    queryKey: ["exp", "detail", initial.slug],
    queryFn: () => ExperienceService.getBySlug(initial.slug),
    initialData: initial,
    staleTime: 30_000,
  });
  const exp: Experience = (data as Experience | undefined) ?? initial;
  if (!exp) return null;

  return (
    <div className="min-h-dvh bg-background">
      {/* HERO VIDEO */}
      <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden bg-black">
        <video
  src="https://qlvsopynxpohlsmlfdsw.supabase.co/storage/v1/object/public/VIDEO%201%20GOPRO/video-gopro-saibreira.mp4"
  poster={exp.horizontal_image_url ?? exp.cover_image_url ?? undefined}
  autoPlay
  muted
  loop
  playsInline
  controls
  className="absolute inset-0 h-full w-full object-cover"
/>
            poster={exp.horizontal_image_url ?? exp.cover_image_url ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            controls
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : exp.horizontal_image_url || exp.cover_image_url ? (
          <img
            src={exp.horizontal_image_url ?? exp.cover_image_url ?? ""}
            alt={exp.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        <div className="relative z-10 container-x flex h-full flex-col items-start justify-end pb-14 pt-24">
          <Link
            to="/experiencias"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur-md hover:border-brand"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Todas as trilhas
          </Link>
          {exp.category && (
            <span className="font-mono text-xs uppercase tracking-[0.35em] text-brand">
              {exp.category.name}
            </span>
          )}
          <h1 className="mt-3 font-display text-5xl leading-[0.95] tracking-wide text-white sm:text-6xl md:text-7xl">
            {exp.name}
          </h1>
          {exp.short_description && (
            <p className="mt-4 max-w-2xl text-base text-white/80 md:text-lg">
              {exp.short_description}
            </p>
          )}
        </div>
      </section>

      {/* STATS + RESERVAR */}
      <section className="container-x -mt-10 relative z-20">
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

      {/* CONTEÚDO */}
      <section className="container-x grid gap-10 py-12 md:grid-cols-3 md:gap-12 md:py-16">
        <div className="space-y-10 md:col-span-2">
          {exp.description && (
            <Block title="Sobre a trilha">
              <p className="whitespace-pre-line leading-relaxed text-foreground/80">{exp.description}</p>
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

          {exp.videos.length > 0 && (
            <Block title="Vídeos extras">
              <div className="grid gap-4 sm:grid-cols-2">
                {exp.videos.map((v) => (
                  <div key={v.id} className="overflow-hidden rounded-xl border border-border/60 bg-black">
                    <div className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-2">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-brand">
                        {v.label || VIDEO_KIND_LABEL[v.kind]}
                      </span>
                      <Play className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <video src={v.url} controls preload="metadata" className="aspect-video w-full" />
                  </div>
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
                      {p.description && <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>}
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

          {exp.route_map_url && (
            <Block title="Mapa da rota">
              <img src={exp.route_map_url} alt={`Mapa — ${exp.name}`} className="w-full rounded-xl border border-border/60" />
            </Block>
          )}
        </div>

        <aside className="space-y-8">
          <SideBlock title="Equipamentos inclusos" items={exp.equipment} />
          <SideBlock title="O que levar" items={exp.what_to_bring} />
          {exp.tags.length > 0 && (
            <div>
              <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Tags</p>
              <div className="flex flex-wrap gap-2">
                {exp.tags.map((t) => (
                  <span key={t} className="rounded-full border border-border/60 px-3 py-1 text-xs">{t}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </div>
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
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
    >
      <h2 className="mb-4 font-display text-3xl uppercase tracking-wide">{title}</h2>
      {children}
    </motion.section>
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
