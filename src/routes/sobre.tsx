import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Heart, Award, Target } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre a Rolezin Frontin Off Road" },
      { name: "description", content: "Conheça a história, missão e valores da Rolezin Frontin Off Road. Passeios de quadriciclo com segurança e paixão em Engenheiro Paulo de Frontin, RJ." },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: SobrePage,
});

const values = [
  { icon: Shield, title: "Segurança", desc: "EPIs completos, veículos revisados e briefing antes de cada passeio." },
  { icon: Heart, title: "Paixão", desc: "A gente faz porque ama. Isso muda tudo na experiência do cliente." },
  { icon: Award, title: "Qualidade", desc: "Equipamentos de primeira linha e atendimento personalizado." },
  { icon: Target, title: "Compromisso", desc: "Cumprimos o que prometemos, do primeiro contato ao pós-passeio." },
];

function SobrePage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container-x">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <span className="eyebrow mb-4">Sobre nós</span>
            <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
              Nascemos <span className="text-brand">na trilha.</span>
            </h1>
            <p className="mt-6 text-foreground/80 leading-relaxed">
              A Rolezin Frontin Off Road começou como um sonho de amigos apaixonados pela serra fluminense.
              Hoje somos referência em turismo de aventura em Engenheiro Paulo de Frontin, guiando milhares de
              pessoas por trilhas que só quem vive aqui conhece.
            </p>
            <p className="mt-4 text-foreground/80 leading-relaxed">
              Cada passeio é planejado para entregar adrenalina com segurança, natureza com respeito e memórias
              que ficam pra sempre.
            </p>
            <Link to="/reservar" className="btn-brand mt-8">Reservar meu passeio</Link>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <img src={heroImg} alt="Aventura off road" loading="lazy" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="mt-24">
          <span className="eyebrow mb-4">Nossos valores</span>
          <h2 className="font-display text-4xl md:text-5xl uppercase">O que nos move.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="p-6 rounded-2xl border border-border/60 bg-card">
                <v.icon className="h-8 w-8 text-brand" strokeWidth={1.5} />
                <h3 className="mt-4 font-display text-xl uppercase">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-2">
          <div className="p-8 rounded-3xl border border-border/60 bg-card">
            <span className="eyebrow mb-3">Missão</span>
            <p className="text-foreground/85 leading-relaxed">
              Proporcionar experiências off road inesquecíveis, unindo aventura, segurança e contato genuíno
              com a natureza.
            </p>
          </div>
          <div className="p-8 rounded-3xl border border-border/60 bg-card">
            <span className="eyebrow mb-3">Visão</span>
            <p className="text-foreground/85 leading-relaxed">
              Ser a maior referência em turismo de aventura off road do Rio de Janeiro, formando uma comunidade
              apaixonada por trilhas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
