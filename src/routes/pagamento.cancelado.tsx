import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle, RotateCcw, Home } from "lucide-react";

export const Route = createFileRoute("/pagamento/cancelado")({
  head: () => ({
    meta: [
      { title: "Pagamento cancelado — Rolezin Frontin Off Road" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CancelPage,
});

function CancelPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="container-x max-w-2xl text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-destructive/20 grid place-items-center border border-destructive">
          <XCircle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="mt-6 font-display text-4xl md:text-5xl uppercase leading-none">
          Pagamento <span className="text-brand">cancelado</span>
        </h1>
        <p className="mt-4 text-muted-foreground text-sm">
          Sua reserva ainda não foi confirmada. Você pode tentar novamente sem perder seus dados.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link to="/reservar" className="btn-brand text-xs">
            <RotateCcw className="h-4 w-4" /> Tentar novamente
          </Link>
          <Link to="/" className="btn-outline-brand text-xs">
            <Home className="h-4 w-4" /> Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}
