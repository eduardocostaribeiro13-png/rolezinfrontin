import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Check, Home, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getReservationByOrder } from "@/lib/checkout.functions";
import { brl } from "@/lib/tours";
import { waLink } from "@/lib/whatsapp";

const search = z.object({ order: z.string().uuid().optional() });

export const Route = createFileRoute("/pagamento/sucesso")({
  head: () => ({
    meta: [
      { title: "Reserva Confirmada — Rolezin Frontin Off Road" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: search,
  component: SuccessPage,
});

function SuccessPage() {
  const { order } = Route.useSearch();
  const fetchReservation = useServerFn(getReservationByOrder);

  const { data, isLoading } = useQuery({
    queryKey: ["reservation", order],
    queryFn: () => fetchReservation({ data: { order_nsu: order! } }),
    enabled: !!order,
    refetchInterval: (q) => {
      const r = q.state.data?.reservation;
      return r && r.payment_status !== "PAID" ? 3000 : false;
    },
  });

  const r = data?.reservation;
  const paid = r?.payment_status === "PAID";

  return (
    <div className="pt-32 pb-24">
      <div className="container-x max-w-2xl">
        <div className="mx-auto h-16 w-16 rounded-full bg-brand/20 grid place-items-center border border-brand">
          <Check className="h-8 w-8 text-brand" />
        </div>
        <h1 className="mt-6 text-center font-display text-4xl md:text-5xl uppercase leading-none">
          {paid ? (
            <>Reserva <span className="text-brand">Confirmada</span></>
          ) : (
            <>Pagamento <span className="text-brand">em análise</span></>
          )}
        </h1>
        <p className="mt-4 text-center text-muted-foreground text-sm">
          {paid
            ? "Recebemos seu pagamento. Prepare-se para a aventura!"
            : "Assim que o pagamento for confirmado, esta página atualiza automaticamente."}
        </p>

        {isLoading && (
          <p className="mt-10 text-center text-sm text-muted-foreground">Carregando reserva…</p>
        )}

        {r && (
          <div className="mt-10 p-6 rounded-2xl border border-brand/50 bg-card">
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <Item k="Número da reserva" v={`#${r.id.slice(0, 8).toUpperCase()}`} />
              <Item k="Nome" v={r.customer_name} />
              <Item k="Passeio" v={r.tour_name} />
              <Item k="Veículo" v={r.vehicle} />
              <Item
                k="Data"
                v={format(new Date(r.reservation_date + "T12:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              />
              <Item k="Horário" v={r.reservation_time} />
              <Item k="Quantidade" v={`${r.adults} adulto(s)${r.kids ? `, ${r.kids} criança(s)` : ""}`} />
              <Item k="Forma de pagamento" v={r.payment_method ?? "—"} />
            </dl>
            <div className="mt-6 pt-6 border-t border-border/60 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Valor pago
              </span>
              <span className="font-display text-3xl text-brand">
                {brl(((r.paid_amount ?? r.total_price) as number) / 100)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link to="/" className="btn-outline-brand text-xs">
            <Home className="h-4 w-4" /> Voltar ao início
          </Link>
          <a
            href={waLink(
              r
                ? `Olá! Acabei de confirmar a reserva #${r.id.slice(0, 8).toUpperCase()} — ${r.tour_name}.`
                : "Olá! Acabei de finalizar um pagamento pelo site.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brand text-xs"
          >
            <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{k}</dt>
      <dd className="mt-1 text-foreground">{v}</dd>
    </div>
  );
}
