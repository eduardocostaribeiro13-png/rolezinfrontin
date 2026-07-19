import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Camera, ChevronRight, Film, Globe2, Sparkles, Video } from "lucide-react";
import type { Experience } from "@/lib/experiences";
import { HeroSkeleton } from "./ExperienceSkeleton";

type Props = {
  exp?: Experience | null;
  isLoading?: boolean;
};

/**
 * HeroExperience
 * Renders the cinematic featured card. Falls back to a premium empty state
 * when no PUBLISHED experience exists yet — ready to be wired to a future
 * `is_featured` flag from the CMS without further changes.
 */
export function HeroExperience({ exp, isLoading }: Props) {
  if (isLoading) return <HeroSkeleton />;
  if (!exp) return <HeroEmptyState />;
  return <HeroFilled exp={exp} />;
}

function HeroFilled({ exp }: { exp: Experience }) {
  const bg = exp.horizontal_image_url ?? exp.cover_image_url;
  const title = exp.name;
  const subtitle = exp.category?.name ?? "Centro de Experiências";
  const description =
    exp.short_description ?? "Trilhas, cachoeiras e mirantes de Engenheiro Paulo de Frontin filmados em cinema real.";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative h-[480px] overflow-hidden rounded-3xl bg-[#0E0E0E] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] md:h-[560px] lg:h-[620px]"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source
          src="https://qlvsopynxpohlsmlfdsw.supabase.co/storage/v1/object/public/VIDEO%201%20GOPRO/download%20(1).mp4"
          type="video/mp4"
        />
      </video>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,193,7,0.14),transparent_60%)]" />
      <NoiseOverlay />

      <div className="relative z-10 flex h-full flex-col items-start justify-end p-8 md:p-12 lg:p-16">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#FFC107]"
        >
          {subtitle}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-4 font-display uppercase leading-[0.88] tracking-[-0.01em] text-white"
          style={{
            fontSize: "clamp(2.5rem, 5.6vw, 5.2rem)",
            fontWeight: 900,
            textShadow: "0 6px 30px rgba(0,0,0,0.7)",
          }}
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-5 max-w-xl text-sm leading-relaxed text-[#BEBEBE] md:text-base"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-7 flex flex-wrap items-center gap-5"
        >
          <Link
            to="/experiencias/$slug"
            params={{ slug: exp.slug }}
            className="inline-flex items-center gap-2 rounded-full bg-[#FFC107] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[0_15px_40px_-10px_rgba(255,193,7,0.6)] transition-all hover:scale-[1.03] hover:bg-[#FFD54F]"
          >
            Assistir experiência <ChevronRight className="h-4 w-4" />
          </Link>

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

function HeroEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-[480px] overflow-hidden rounded-3xl bg-[#0A0A0A] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] md:h-[560px] lg:h-[620px]"
    >
      {/* Ambient placeholder background */}
      <div
        aria-hidden
        className="absolute inset-0 scale-110 blur-[2px]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 30%, rgba(255,193,7,0.18), transparent 60%), radial-gradient(ellipse 70% 50% at 80% 70%, rgba(255,87,34,0.12), transparent 60%), linear-gradient(135deg, #0E0E0E 0%, #1a1208 40%, #050505 100%)",
        }}
      />
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60" />
      <NoiseOverlay />

      {/* Floating orbs for depth */}
      <motion.div
        aria-hidden
        animate={{ y: [0, -20, 0], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[15%] top-[30%] h-40 w-40 rounded-full bg-[#FFC107]/10 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[20%] bottom-[25%] h-56 w-56 rounded-full bg-orange-500/10 blur-3xl"
      />

      <div className="relative z-10 flex h-full flex-col items-start justify-end p-8 md:p-12 lg:p-16">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.4em] text-[#FFC107]"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Centro de Experiências
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-4 font-display uppercase leading-[0.88] tracking-[-0.01em] text-white"
          style={{
            fontSize: "clamp(2.5rem, 5.6vw, 5.2rem)",
            fontWeight: 900,
            textShadow: "0 6px 30px rgba(0,0,0,0.7)",
          }}
        >
          Sua próxima
          <br />
          <span className="text-[#FFC107]">aventura</span> começa aqui.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-5 max-w-xl text-sm leading-relaxed text-[#BEBEBE] md:text-base"
        >
          Cadastre uma experiência em destaque pelo painel administrativo para preencher automaticamente esta área com
          vídeos, imagens e descrição da trilha.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mt-7 flex flex-wrap items-center gap-5"
        >
          <Link
            to="/admin/experiencias/$id"
            params={{ id: "new" }}
            className="inline-flex items-center gap-2 rounded-full bg-[#FFC107] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[0_15px_40px_-10px_rgba(255,193,7,0.6)] transition-all hover:scale-[1.03] hover:bg-[#FFD54F]"
          >
            Criar primeira experiência <ChevronRight className="h-4 w-4" />
          </Link>

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

function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
      }}
    />
  );
}
