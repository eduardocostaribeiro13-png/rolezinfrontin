import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Ban, Printer, Search } from "lucide-react";
import { AdminService, brlCents, type Reservation } from "@/lib/services/admin-service";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/reservas")({
  component: AdminReservas,
});

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "PAID", label: "Pagas" },
  { value: "PENDING_PAYMENT", label: "Pendentes" },
  { value: "FAILED", label: "Falhas" },
  { value: "CANCELLED", label: "Canceladas" },
  { value: "COMPLETED", label: "Realizadas" },
] as const;

function AdminReservas() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reservations"],
    queryFn: () => AdminService.listReservations(),
  });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [selected, setSelected] = useState<Reservation | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (data ?? []).filter((r) => {
      if (status && r.payment_status !== status) return false;
      if (!t) return true;
      return (
        r.customer_name.toLowerCase().includes(t) ||
        r.customer_email.toLowerCase().includes(t) ||
        r.customer_phone.toLowerCase().includes(t) ||
        r.tour_name.toLowerCase().includes(t) ||
        r.vehicle.toLowerCase().includes(t) ||
        r.order_nsu.toLowerCase().includes(t)
      );
    });
  }, [data, q, status]);

  const cancelMut = useMutation({
    mutationFn: (id: string) => AdminService.updateReservationStatus(id, "CANCELLED"),
    onSuccess: () => {
      toast.success("Reserva cancelada");
      qc.invalidateQueries({ queryKey: ["admin", "reservations"] });
      setCancelTarget(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao cancelar"),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Operacional</p>
        <h1 className="font-display text-4xl uppercase leading-none mt-2">Reservas</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail, telefone, passeio..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs font-mono uppercase tracking-widest text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Cliente</th>
                  <th className="text-left px-4 py-3">Passeio</th>
                  <th className="text-left px-4 py-3">Data / Hora</th>
                  <th className="text-right px-4 py-3">Valor</th>
                  <th className="text-right px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      Nenhuma reserva encontrada.
                    </td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <StatusBadge status={r.payment_status} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{r.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{r.tour_name}</p>
                      <p className="text-xs text-muted-foreground">{r.vehicle}</p>
                    </td>
                    <td className="px-4 py-3">
                      {format(parseISO(r.reservation_date), "dd/MM/yyyy")}{" "}
                      <span className="text-muted-foreground">{r.reservation_time}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {brlCents(r.paid_amount ?? r.total_price)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          className="text-xs px-2 py-1 rounded border border-border/60 hover:border-brand hover:text-brand"
                          onClick={() => setSelected(r)}
                        >
                          Ver
                        </button>
                        <button
                          className="text-xs p-1.5 rounded border border-border/60 hover:border-brand hover:text-brand"
                          onClick={() => window.print()}
                          aria-label="Imprimir"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                        {r.payment_status !== "CANCELLED" && (
                          <button
                            className="text-xs p-1.5 rounded border border-border/60 hover:border-destructive hover:text-destructive"
                            onClick={() => setCancelTarget(r)}
                            aria-label="Cancelar"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reserva {selected?.order_nsu.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selected && <ReservationDetails r={selected} />}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar reserva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação libera o horário para novos clientes. Não é reversível.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelTarget && cancelMut.mutate(cancelTarget.id)}
            >
              Cancelar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ReservationDetails({ r }: { r: Reservation }) {
  const rows: [string, string][] = [
    ["Status", r.payment_status],
    ["Cliente", r.customer_name],
    ["Telefone", r.customer_phone],
    ["WhatsApp", r.customer_whatsapp ?? "—"],
    ["E-mail", r.customer_email],
    ["Cidade / UF", [r.customer_city, r.customer_state].filter(Boolean).join(" / ") || "—"],
    ["Passeio", r.tour_name],
    ["Veículo", r.vehicle],
    ["Data", format(parseISO(r.reservation_date), "dd/MM/yyyy")],
    ["Horário", r.reservation_time],
    ["Participantes", String(r.quantity)],
    ["Valor total", brlCents(r.total_price)],
    ["Valor pago", r.paid_amount != null ? brlCents(r.paid_amount) : "—"],
    ["Forma de pagamento", r.payment_method ?? "—"],
    ["Parcelas", r.installments != null ? String(r.installments) : "—"],
    ["Pago em", r.paid_at ? format(parseISO(r.paid_at), "dd/MM/yyyy HH:mm") : "—"],
    ["Transaction NSU", r.transaction_nsu ?? "—"],
    ["Invoice slug", r.invoice_slug ?? "—"],
    ["Código da reserva", r.order_nsu],
  ];
  return (
    <div className="space-y-4 text-sm">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-border/40 py-1">
            <dt className="text-muted-foreground text-xs uppercase tracking-widest font-mono">
              {k}
            </dt>
            <dd className="text-right break-all">{v}</dd>
          </div>
        ))}
      </dl>
      {r.notes && (
        <div>
          <p className="eyebrow mb-1">Observações</p>
          <p className="text-sm">{r.notes}</p>
        </div>
      )}
      {r.receipt_url && (
        <a
          href={r.receipt_url}
          target="_blank"
          rel="noreferrer"
          className="btn-outline-brand text-xs w-fit"
        >
          Ver comprovante InfinitePay
        </a>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    PENDING_PAYMENT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    FAILED: "bg-destructive/20 text-destructive border-destructive/40",
    CANCELLED: "bg-muted text-muted-foreground border-border/60",
    COMPLETED: "bg-brand/20 text-brand border-brand/40",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest whitespace-nowrap ${styles[status] ?? styles.CANCELLED}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
