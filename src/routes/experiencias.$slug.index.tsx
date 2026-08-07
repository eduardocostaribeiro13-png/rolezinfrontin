import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Ruler,
  Mountain,
  Users,
  Tag,
  MapPin,
  Play,
  Navigation,
  Gauge,
  Car,
  Sparkles,
  FileText,
  CheckCircle2,
  Backpack,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import { ExperienceService } from "@/lib/services/experience-service";
import { AdminService } from "@/lib/services/admin-service";
import type { Experience } from "@/lib/experiences";
import { brlCents, collectExperienceVideos } from "@/lib/experiences";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/experiencias/$slug/")({
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
      return {
        meta: [{ title: "Experiência não encontrada" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = loaderData.seo_title || `${loaderData.name} — Rolezin Frontin`;
    const description =
      loaderData.seo_description ||
      loaderData.short_description ||
      "Experiência off-road em Engenheiro Paulo de Frontin.";
    const image = loaderData.og_image_url || loaderData.cover_image_url || undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
              { name: "twitter:card", content: "summary_large_image" },
            ]
          : []),
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
      <p role="alert" className="text-sm text-destructive">
        Erro: {error.message}
      </p>
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

  const { data: settings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => AdminService.getSettings(),
    staleTime: 60_000,
  });

  const { data: vehicleTypes = [] } = useQuery({
    queryKey: ["exp", "vehicle-types"],
    queryFn: () => ExperienceService.listVehicleTypes(),
    staleTime: 5 * 60_000,
  });

  if (!exp) return null;

  const videos = collectExperienceVideos(exp);
  const heroImage = exp.horizontal_image_url ?? exp.cover_image_url ?? exp.og_image_url ?? undefined;
  const vehicleNames = vehicleTypes
    .filter((v) => exp.vehicle_type_ids.includes(v.id))
    .map((v) => v.name);

  const mapsUrl =
    settings?.maps_url?.trim() ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${exp.name} Engenheiro Paulo de Frontin RJ`,
    )}`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(
    settings?.address?.trim() || `${exp.name} Engenheiro Paulo de Frontin RJ`,
  )}`;
  const whatsapp = (settings?.whatsapp || settings?.phone || "").replace(/\D/g, "");
  const estimatedMin = Math.max(5, Math.round(exp.distance_km * 2.5));

  return (
    <div className="min-h-dvh bg-background">
      {/* ================= HERO ================= */}
      <section className="relative min-h-[62vh] w-full overflow-hidden bg-black md:min-h-0 md:h-[660px]">
        {heroImage ? (
          <img
            src={heroImage}
            alt={exp.name}
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/60" />

        <div className="container-x relative z-10 flex h-full min-h-[62vh] flex-col justify-center pb-24 pt-28 md:min-h-0 md:pb-28">
          <Link
            to="/experiencias"
            className="absolute left-4 top-24 inline-flex items-center gap-2 rounded-md border border-white/15 bg-black/60 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur-md transition hover:border-brand hover:text-brand md:left-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Todas as experiências
          </Link>

          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-brand">
            {exp.category?.name ?? "Experiência"}
          </span>

          <h1 className="mt-2 font-display text-5xl leading-[0.9] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            {exp.name}
          </h1>

          {exp.short_description && (
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
              {exp.short_description}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/reservar"
              search={{ experience: exp.slug }}
              className="inline-flex h-[54px] items-center justify-center gap-2 rounded-md bg-brand px-6 font-mono text-xs font-bold uppercase tracking-widest text-brand-foreground transition hover:brightness-110"
            >
              <CalendarDays className="h-4 w-4" /> Reservar esta experiência
            </Link>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[54px] items-center justify-center gap-2 rounded-md border border-white/25 bg-black/40 px-6 font-mono text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md transition hover:border-brand hover:text-brand"
            >
              <MapPin className="h-4 w-4" /> Ver rota
            </a>
          </div>
        </div>
      </section>

      {/* ================= PAINEL FLUTUANTE ================= */}
      <section className="container-x relative z-20 -mt-16 md:-mt-20">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur">
          <div className="grid grid-cols-2 divide-border/60 sm:grid-cols-3 lg:grid-cols-6 lg:divide-x">
            <Stat icon={<Clock />} label="Duração" value={`${exp.duration_hours}h`} />
            <Stat icon={<Ruler />} label="Distância" value={`${exp.distance_km} km`} />
            <Stat icon={<Mountain />} label="Altitude" value={`${exp.altitude_m} m`} />
            <Stat icon={<Users />} label="Máx." value={`${exp.max_people}p`} />
            <div className="col-span-2 flex items-center justify-between gap-4 border-t border-border/60 p-4 sm:col-span-1 lg:col-span-2 lg:border-t-0">
              {exp.price_cents > 0 && (
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-brand" />
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      A partir de
                    </p>
                    <p className="font-display text-xl leading-none text-foreground">
                      {brlCents(exp.price_cents)}
                    </p>
                  </div>
                </div>
              )}
              <Link
                to="/reservar"
                search={{ experience: exp.slug }}
                className="ml-auto inline-flex h-11 items-center rounded-md bg-brand px-4 font-mono text-[11px] font-bold uppercase tracking-widest text-brand-foreground transition hover:brightness-110"
              >
                Reservar agora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMO CHEGAR ================= */}
      <Section title="Como chegar">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card">
            <span className="absolute left-4 top-4 z-10 rounded-md bg-black/75 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur">
              Rota da experiência
            </span>
            {exp.route_map_url ? (
              <img
                src={exp.route_map_url}
                alt={`Mapa da rota — ${exp.name}`}
                loading="lazy"
                className="h-full min-h-[260px] w-full object-cover"
              />
            ) : (
              <div className="grid min-h-[260px] place-items-center p-8 text-center">
                <div>
                  <Navigation className="mx-auto h-8 w-8 text-brand" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Mapa da rota ainda não cadastrado no painel desta experiência.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col rounded-xl border border-border/60 bg-card p-5">
            <RoutePoint
              tone="start"
              label="Ponto de encontro (início)"
              lines={[settings?.address ?? "Eng. Paulo de Frontin - RJ"]}
            />
            <div className="my-3 ml-[10px] h-6 border-l border-dashed border-border" />
            <RoutePoint
              tone="end"
              label="Destino da experiência"
              lines={[exp.name, "Eng. Paulo de Frontin - RJ"]}
            />

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/60 pt-4">
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <Ruler className="h-4 w-4 text-brand" />
                <strong className="text-foreground">{exp.distance_km} km</strong> distância
              </span>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <Clock className="h-4 w-4 text-brand" />
                <strong className="text-foreground">{estimatedMin} min</strong> estimado
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-4 font-mono text-[11px] font-bold uppercase tracking-widest text-brand-foreground transition hover:brightness-110"
              >
                <MapPin className="h-4 w-4" /> Abrir no Google Maps
              </a>
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 font-mono text-[11px] font-bold uppercase tracking-widest text-secondary-foreground transition hover:border-brand hover:text-brand"
              >
                <Navigation className="h-4 w-4" /> Abrir no Waze
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* ================= SOBRE A EXPERIÊNCIA ================= */}
      <Section title="Sobre a experiência">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {exp.description && (
            <InfoCard icon={<FileText />} title="Descrição" text={exp.description} />
          )}
          {exp.equipment.length > 0 && (
            <InfoCard icon={<CheckCircle2 />} title="Inclui" items={exp.equipment} />
          )}
          {exp.what_to_bring.length > 0 && (
            <InfoCard icon={<Backpack />} title="Recomendamos" items={exp.what_to_bring} />
          )}
          {exp.curiosities.length > 0 && (
            <InfoCard icon={<Sparkles />} title="Curiosidades" items={exp.curiosities} />
          )}
          <InfoCard icon={<Gauge />} title="Nível" text={exp.level} compact />
          {vehicleNames.length > 0 && (
            <InfoCard icon={<Car />} title="Veículo" text={vehicleNames.join(" e ")} compact />
          )}
          <InfoCard icon={<Users />} title="Capacidade" text={`Até ${exp.max_people} pessoas`} compact />
          <InfoCard icon={<Clock />} title="Duração" text={`${exp.duration_hours} horas`} compact />
        </div>

        {exp.points_of_interest.length > 0 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exp.points_of_interest.map((p, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-border/60 bg-card p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <div>
                  <p className="font-display text-lg uppercase leading-tight tracking-wide">{p.name}</p>
                  {p.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* ================= VÍDEOS + GALERIA ================= */}
      {(videos.length > 0 || exp.gallery.length > 0) && (
        <section className="container-x py-10 md:py-14">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionTitle>Vídeos da experiência</SectionTitle>
              {videos.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {videos.map((v, i) => (
                    <Link
                      key={v.key}
                      to="/experiencias/$slug/video/$videoKey"
                      params={{ slug: exp.slug, videoKey: v.key }}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group relative overflow-hidden rounded-xl border border-border/60 bg-black transition hover:border-brand",
                        i === 0 && "sm:col-span-2",
                      )}
                    >
                      <video
                        src={v.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="pointer-events-none aspect-video w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                      />
                      <span className="pointer-events-none absolute inset-0 grid place-items-center">
                        <span className="grid h-12 w-12 place-items-center rounded-full bg-black/60 backdrop-blur transition group-hover:bg-brand">
                          <Play className="h-5 w-5 text-white group-hover:text-brand-foreground" />
                        </span>
                      </span>
                      <span className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-2 pt-8 font-mono text-[10px] uppercase tracking-widest text-white">
                        {v.title}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyBox text="Nenhum vídeo cadastrado. Adicione em Admin → Experiências → editar." />
              )}
            </div>

            <div>
              <SectionTitle>Galeria da experiência</SectionTitle>
              {exp.gallery.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {exp.gallery.slice(0, 7).map((g, i) => (
                    <img
                      key={g.id}
                      src={g.url}
                      alt={g.caption ?? exp.name}
                      loading="lazy"
                      className={cn(
                        "w-full rounded-xl object-cover transition duration-500 hover:brightness-110",
                        i === 0 ? "col-span-2 row-span-2 h-full min-h-[180px]" : "aspect-[4/3]",
                      )}
                    />
                  ))}
                </div>
              ) : (
                <EmptyBox text="Nenhuma foto cadastrada para esta experiência." />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ================= BANNER FINAL ================= */}
      <section className="container-x pb-16 pt-4">
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card">
          {heroImage && (
            <img
              src={heroImage}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
          )}
          <div className="relative flex flex-col items-start gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="flex items-center gap-4">
              <CalendarDays className="hidden h-10 w-10 shrink-0 text-brand sm:block" />
              <div>
                <p className="font-display text-2xl uppercase leading-tight tracking-wide md:text-3xl">
                  Pronto para viver essa experiência?
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Garanta agora sua vaga e prepare-se para momentos inesquecíveis.
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
              <Link
                to="/reservar"
                search={{ experience: exp.slug }}
                className="inline-flex h-[54px] items-center justify-center gap-2 rounded-md bg-brand px-6 font-mono text-xs font-bold uppercase tracking-widest text-brand-foreground transition hover:brightness-110"
              >
                <CalendarDays className="h-4 w-4" /> Reservar agora
              </Link>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                    `Olá! Tenho interesse na experiência ${exp.name}.`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[54px] items-center justify-center gap-2 rounded-md border border-border bg-background px-6 font-mono text-xs font-bold uppercase tracking-widest text-foreground transition hover:border-brand hover:text-brand"
                >
                  <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------------- UI ---------------------------------- */

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border/60 p-4 lg:border-b-0">
      <span className="text-brand [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="font-display text-xl leading-none">{value}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 inline-block border-b-2 border-brand pb-1 font-display text-2xl uppercase tracking-wide md:text-3xl">
      {children}
    </h2>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className="container-x py-10 md:py-14"
    >
      <SectionTitle>{title}</SectionTitle>
      {children}
    </motion.section>
  );
}

function RoutePoint({
  tone,
  label,
  lines,
}: {
  tone: "start" | "end";
  label: string;
  lines: string[];
}) {
  return (
    <div className="flex gap-3">
      <MapPin
        className={cn("mt-0.5 h-5 w-5 shrink-0", tone === "start" ? "text-emerald-400" : "text-brand")}
      />
      <div>
        <p
          className={cn(
            "font-mono text-[10px] uppercase tracking-widest",
            tone === "start" ? "text-emerald-400" : "text-brand",
          )}
        >
          {label}
        </p>
        {lines.map((l, i) => (
          <p key={i} className="text-sm text-foreground/85">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
  items,
  compact,
}: {
  icon: React.ReactNode;
  title: string;
  text?: string;
  items?: string[];
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 transition hover:border-brand/50">
      <p className="mb-2 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-brand">
        <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
        {title}
      </p>
      {text && (
        <p
          className={cn(
            "whitespace-pre-line text-foreground/80",
            compact ? "font-display text-lg uppercase tracking-wide" : "text-sm leading-relaxed",
          )}
        >
          {text}
        </p>
      )}
      {items && (
        <ul className="space-y-1.5 text-sm text-foreground/80">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-brand">→</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-border/60 bg-card p-5 text-sm text-muted-foreground">
      {text}
    </p>
  );
}
