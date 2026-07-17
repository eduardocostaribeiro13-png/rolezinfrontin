import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Mountain,
  ShieldCheck,
  Camera,
  UsersRound,
  Sparkles,
  Leaf,
  Compass,
  Star,
  MapPin,
  Clock,
  Gauge,
  ArrowRight,
} from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import ctaImg from "@/assets/cta.jpg";
import sobreImg from "@/assets/sobre.jpg";
import heroTitleImg from "@/assets/hero-title.png";
import { brlCents, type Tour } from "@/lib/tours";
import { useQuery } from "@tanstack/react-query";
import { TourService } from "@/lib/services/tour-service";
import { Skeleton } from "@/components/ui/skeleton";
import { waQuickBooking } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rolezin Frontin Off Road — Passeios de Quadriciclo em Eng. Paulo de Frontin, RJ" },
      {
        name: "description",
        content:
          "Viva uma aventura off road inesquecível em Engenheiro Paulo de Frontin. Passeios de quadriciclo e UTV com guias experientes, segurança e fotos incluídas.",
      },
      {
        property: "og:title",
        content: "Rolezin Frontin Off Road — Passeios de Quadriciclo em Eng. Paulo de Frontin, RJ",
      },
      { property: "og:image", content: "/assets/hero.jpg" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
} as const;

function HomePage() {
  return (
    <>
      <Hero />
      <Sobre />
      <Diferenciais />
      <Passeios />
      <Estatisticas />
      <ComoFunciona />
      <Depoimentos />
      <FAQ />
      <CTAFinal />
    </>
  );
}

/* -------- HERO -------- */
function Hero() {
  return (
    <section className="hero-section relative h-dvh min-h-[560px] md:min-h-[640px] max-h-[900px] w-full overflow-hidden">
      <div className="absolute inset-0 animate-ken-burns">
        <img
          src={heroImg}
          alt="Quadriciclo amarelo em trilha off road nas montanhas de Engenheiro Paulo de Frontin"
          className="h-full w-full object-cover object-[65%_center] md:object-center"
          width={1920}
          height={1280}
          fetchPriority="high"
        />
      </div>
      <div className="hero-overlay absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black md:from-black/70 md:via-black/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,black_100%)] opacity-70 md:opacity-100" />

      <div className="relative z-10 h-full container-x flex flex-col justify-end md:justify-center pt-24 pb-24 md:pt-24 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <span className="eyebrow mb-3 sm:mb-6"></span>
          <h1 className="hero-title -mx-2 sm:mx-0">
            <span className="sr-only">A aventura começa aqui.</span>
            <img
              src={heroTitleImg}
              alt="A aventura começa aqui"
              width={1600}
              height={912}
              fetchPriority="high"
              className="w-full max-w-[36rem] sm:max-w-[42rem] md:max-w-[52rem] lg:max-w-[60rem] h-auto select-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
              draggable={false}
            />
          </h1>
          <p className="mt-3 sm:mt-6 max-w-[34ch] sm:max-w-xl text-[0.95rem] sm:text-lg leading-relaxed text-foreground/85">
            Descubra as trilhas mais incríveis de Engenheiro Paulo de Frontin em passeios de quadriciclo e UTV guiados
            por profissionais.
          </p>
          <div className="mt-5 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
            <Link to="/reservar" className="btn-brand w-full sm:w-auto">
              Reservar Agora <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/passeios" className="btn-outline-brand w-full sm:w-auto">
              Conheça os passeios
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="hero-scroll-hint absolute bottom-5 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2 text-foreground/70">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Role a página</span>
        <ChevronDown className="h-5 w-5 animate-scroll-hint" />
      </div>
    </section>
  );
}

/* -------- SOBRE -------- */
function Sobre() {
  return (
    <section className="section-pad bg-grain">
      <div className="container-x grid gap-12 md:grid-cols-2 md:items-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <span className="eyebrow mb-4">Sobre nós</span>
          <h2 className="font-display text-5xl md:text-6xl uppercase leading-none">
            Aventura com <span className="text-brand">alma off road.</span>
          </h2>
          <p className="mt-6 text-foreground/80 leading-relaxed">
            Somos apaixonados por trilhas, natureza e adrenalina. Há anos guiamos turistas, casais, famílias e grupos de
            amigos pelas paisagens mais incríveis de Engenheiro Paulo de Frontin, no Rio de Janeiro, com foco total em
            segurança, diversão e memórias inesquecíveis.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Guias experientes e certificados",
              "Equipamentos revisados e de primeira linha",
              "Atendimento personalizado do início ao fim",
              "Fotos e vídeos do seu rolê inclusos",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-foreground/85">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/60"
        >
          <img
            src={sobreImg}
            alt="Passeio ao pôr do sol com quadriciclo em Frontin"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="font-display text-3xl uppercase leading-none">Serra do RJ</p>
            <p className="mt-1 text-sm text-foreground/80">Trilhas exclusivas por natureza intocada.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* -------- DIFERENCIAIS -------- */
const diffs = [
  { icon: Mountain, title: "Trilhas incríveis", desc: "Rotas exclusivas por serras, rios e cachoeiras da região." },
  { icon: Leaf, title: "Natureza exuberante", desc: "Mata atlântica preservada e paisagens de tirar o fôlego." },
  { icon: Compass, title: "Guias experientes", desc: "Profissionais com anos de estrada e conhecimento do terreno." },
  { icon: ShieldCheck, title: "Segurança garantida", desc: "Equipamentos revisados, EPIs e briefing completo." },
  { icon: Camera, title: "Fotos incluídas", desc: "Registramos seus melhores momentos durante o passeio." },
  { icon: UsersRound, title: "Atendimento premium", desc: "Do primeiro contato ao pós-passeio, você é prioridade." },
  { icon: Sparkles, title: "Diversão garantida", desc: "Adrenalina na medida certa para todos os perfis." },
];

function Diferenciais() {
  return (
    <section className="section-pad border-y border-border/40 bg-[oklch(0.11_0_0)]">
      <div className="container-x">
        <div className="mb-14 max-w-2xl">
          <span className="eyebrow mb-4">Por que escolher</span>
          <h2 className="font-display text-5xl md:text-6xl uppercase leading-none">
            Feito pra quem <span className="text-brand">vive de verdade.</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diffs.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group relative p-8 rounded-2xl border border-border/60 bg-card hover:border-brand/60 transition-colors overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <d.icon className="h-8 w-8 text-brand" strokeWidth={1.5} />
              <h3 className="mt-5 text-lg font-semibold leading-relaxed text-foreground">{d.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- PASSEIOS -------- */
function Passeios() {
  const { data, isLoading } = useQuery({
    queryKey: ["tours", "public"],
    queryFn: () => TourService.list(),
    staleTime: 60_000,
  });
  return (
    <section className="section-pad">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="eyebrow mb-4">Nossos passeios</span>
            <h2 className="font-display text-5xl md:text-6xl uppercase leading-none">
              Escolha sua <span className="text-brand">trilha.</span>
            </h2>
          </div>
          <Link to="/passeios" className="btn-outline-brand text-xs">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-96 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {(data ?? []).map((t, i) => (
              <TourCard key={t.slug} tour={t} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function fmtDuration(h: number) {
  if (Number.isInteger(h)) return `${h}h`;
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${hours}h${minutes.toString().padStart(2, "0")}`;
}

export function TourCard({ tour, index = 0 }: { tour: Tour; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.06 }}
      className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card"
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        {tour.image_url ? (
          <img
            src={tour.image_url}
            alt={tour.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full bg-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="glass px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest">
            {tour.level}
          </span>
          {tour.category && (
            <span className="glass px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest">
              {tour.category}
            </span>
          )}
        </div>
        <div className="absolute top-4 right-4 glass px-4 py-2 rounded-full">
          <span className="font-display text-lg leading-none">{brlCents(tour.price_per_hour_cents)}</span>
          <span className="ml-1 text-[10px] font-mono uppercase text-foreground/70">/ hora</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h3 className="font-display text-3xl md:text-4xl uppercase leading-none">{tour.name}</h3>
          {tour.short_description && (
            <p className="mt-2 text-sm text-foreground/80 max-w-md">{tour.short_description}</p>
          )}
        </div>
      </div>
      <div className="p-6 flex flex-wrap items-center gap-x-6 gap-y-3 justify-between">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-brand" /> {fmtDuration(tour.duration_hours)}
          </span>
          <span className="flex items-center gap-1.5">
            <UsersRound className="h-3.5 w-3.5 text-brand" /> Até {tour.max_people}
          </span>
          <span className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-brand" /> {tour.level}
          </span>
        </div>
        <Link to="/reservar" search={{ tour: tour.slug }} className="btn-brand text-xs">
          Reservar agora
        </Link>
      </div>
    </motion.article>
  );
}

/* -------- ESTATÍSTICAS -------- */
function Estatisticas() {
  const stats = [
    { value: "5.000+", label: "Clientes atendidos" },
    { value: "12.000+", label: "Passeios realizados" },
    { value: "80.000", label: "Km percorridos" },
    { value: "4.9", label: "Avaliação média" },
    { value: "8", label: "Anos de estrada" },
  ];
  return (
    <section className="section-pad relative overflow-hidden bg-brand text-brand-foreground">
      <div className="container-x relative">
        <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-5 text-center">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`
      text-center
      ${i === 1 ? "md:-translate-x-8" : ""}
      ${i === 2 ? "md:translate-x-8" : ""}
    `}
            >
              <p className="font-display text-4xl sm:text-5xl md:text-6xl leading-none">{s.value}</p>

              <p className="mt-2 text-[11px] sm:text-xs font-mono uppercase tracking-widest opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- COMO FUNCIONA -------- */
function ComoFunciona() {
  const steps = [
    { n: "01", t: "Escolha o passeio", d: "Explore nossas opções e encontre a aventura ideal." },
    { n: "02", t: "Selecione a data", d: "Marque no calendário o dia livre para o rolê." },
    { n: "03", t: "Realize a reserva", d: "Envie seus dados e confirme pelo WhatsApp." },
    { n: "04", t: "Receba a confirmação", d: "Nossa equipe entra em contato com todos os detalhes." },
    { n: "05", t: "Viva a aventura", d: "Chegue, pilote e leve pra casa memórias inesquecíveis." },
  ];
  return (
    <section className="section-pad">
      <div className="container-x">
        <div className="mb-12 max-w-2xl">
          <span className="eyebrow mb-4">Como funciona</span>
          <h2 className="font-display text-5xl md:text-6xl uppercase leading-none">
            Simples como <span className="text-brand">acelerar.</span>
          </h2>
        </div>
        <ol className="relative grid gap-4 md:grid-cols-5">
          {steps.map((s) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-6 rounded-2xl border border-border/60 bg-card"
            >
              <span className="font-display text-5xl text-brand/40 leading-none">{s.n}</span>
              <h3 className="mt-4 font-display text-xl uppercase">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------- DEPOIMENTOS -------- */
const testimonials = [
  {
    name: "Ana & Rafael",
    city: "Rio de Janeiro, RJ",
    text: "Melhor experiência do nosso aniversário. Trilhas incríveis e equipe atenciosa do começo ao fim!",
  },
  {
    name: "Pedro Mendes",
    city: "São Paulo, SP",
    text: "Adrenalina pura! Guias super profissionais, quadriciclos novos e paisagens surreais. Voltarei com certeza.",
  },
  {
    name: "Camila Rocha",
    city: "Belo Horizonte, MG",
    text: "Fizemos o Rolezão Completo em família e as crianças AMARAM. Segurança impecável.",
  },
  {
    name: "Diego Alves",
    city: "Petrópolis, RJ",
    text: "Cachoeira escondida, drone gravando, almoço caipira delícia. Nota mil!",
  },
];

function Depoimentos() {
  return (
    <section className="section-pad bg-[oklch(0.11_0_0)] border-y border-border/40">
      <div className="container-x">
        <div className="mb-12 max-w-2xl">
          <span className="eyebrow mb-4">Depoimentos</span>
          <h2 className="font-display text-5xl md:text-6xl uppercase leading-none">
            Quem viveu, <span className="text-brand">recomenda.</span>
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl border border-border/60 bg-card"
            >
              <div className="flex gap-1 mb-4 text-brand">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="text-sm text-foreground/85 leading-relaxed">"{t.text}"</blockquote>
              <figcaption className="mt-5">
                <p className="font-display text-lg uppercase leading-none">{t.name}</p>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">{t.city}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------- FAQ -------- */
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Precisa de CNH?",
    a: "Não é obrigatório para pilotar em nossas trilhas privadas, mas você recebe instrução completa antes do passeio.",
  },
  {
    q: "Posso levar crianças?",
    a: "Sim! Crianças a partir de 5 anos podem ir como passageiras, sempre acompanhadas de um adulto responsável.",
  },
  {
    q: "Tem seguro?",
    a: "Todos os passeios contam com seguro contra acidentes pessoais e cobertura para os participantes.",
  },
  {
    q: "E se chover no dia?",
    a: "Trilhas leves acontecem com chuva leve. Em caso de temporal, remarcamos sem custo adicional.",
  },
  { q: "Quanto tempo dura?", a: "Depende do passeio escolhido: de 2h até 6h, incluindo briefing, paradas e fotos." },
  {
    q: "Posso pilotar sozinho?",
    a: "Sim! Após o briefing e o teste rápido em área controlada, você assume o controle do seu quadriciclo.",
  },
];

function FAQ() {
  return (
    <section className="section-pad">
      <div className="container-x grid gap-12 md:grid-cols-[1fr_1.4fr]">
        <div>
          <span className="eyebrow mb-4">Perguntas frequentes</span>
          <h2 className="font-display text-5xl md:text-6xl uppercase leading-none">
            Tira as dúvidas <span className="text-brand">e bora.</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-sm">
            Não achou o que procurava? Chama a gente no WhatsApp que resolvemos rapidinho.
          </p>
          <a href={waQuickBooking()} target="_blank" rel="noreferrer" className="btn-outline-brand mt-6 text-xs">
            Falar no WhatsApp
          </a>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
              <AccordionTrigger className="font-display text-lg uppercase tracking-wide hover:no-underline hover:text-brand">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-foreground/80 leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* -------- CTA FINAL -------- */
function CTAFinal() {
  return (
    <section className="relative overflow-hidden">
      <img src={ctaImg} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />
      <div className="relative container-x py-20 sm:py-28 md:py-36 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <span className="eyebrow mb-6 justify-center">Bora?</span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-8xl uppercase leading-[0.9]">
            Pronto pra uma aventura
            <br />
            <span className="text-gradient-brand">inesquecível?</span>
          </h2>
          <p className="mt-6 max-w-xl mx-auto text-foreground/85">
            Reserve agora e garanta seu lugar nas trilhas mais incríveis de Engenheiro Paulo de Frontin.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            <Link to="/reservar" className="btn-brand w-full sm:w-auto">
              Reservar Agora <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={waQuickBooking()} target="_blank" rel="noreferrer" className="btn-outline-brand w-full sm:w-auto">
              Falar no WhatsApp
            </a>
          </div>
          <p className="mt-6 text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-brand" /> Engenheiro Paulo de Frontin - RJ
          </p>
        </motion.div>
      </div>
    </section>
  );
}
