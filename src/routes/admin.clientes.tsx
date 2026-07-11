import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Search } from "lucide-react";
import { AdminService, brlCents } from "@/lib/services/admin-service";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/clientes")({
  component: AdminClientes,
});

type Client = {
  key: string;
  name: string;
  email: string;
  phone: string;
  count: number;
  spent: number;
  last: string;
};

function AdminClientes() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reservations"],
    queryFn: () => AdminService.listReservations(),
  });
  const [q, setQ] = useState("");

  const clients = useMemo<Client[]>(() => {
    const map = new Map<string, Client>();
    (data ?? []).forEach((r) => {
      const key = r.customer_email.trim().toLowerCase() || r.customer_phone;
      const existing = map.get(key);
      const paid = r.payment_status === "PAID" ? r.paid_amount ?? r.total_price : 0;
      if (existing) {
        existing.count += 1;
        existing.spent += paid;
        if (r.created_at > existing.last) existing.last = r.created_at;
      } else {
        map.set(key, {
          key,
          name: r.customer_name,
          email: r.customer_email,
          phone: r.customer_phone,
          count: 1,
          spent: paid,
          last: r.created_at,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.last.localeCompare(a.last));
  }, [data]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(t) ||
        c.email.toLowerCase().includes(t) ||
        c.phone.toLowerCase().includes(t),
    );
  }, [clients, q]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">CRM</p>
        <h1 className="font-display text-4xl uppercase leading-none mt-2">Clientes</h1>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, e-mail ou telefone"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs font-mono uppercase tracking-widest text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left px-4 py-3">Cliente</th>
                  <th className="text-left px-4 py-3">Contato</th>
                  <th className="text-right px-4 py-3">Reservas</th>
                  <th className="text-right px-4 py-3">Total pago</th>
                  <th className="text-left px-4 py-3">Última reserva</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                )}
                {filtered.map((c) => (
                  <tr key={c.key} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">
                      <p>{c.email}</p>
                      <p className="text-xs text-muted-foreground">{c.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{c.count}</td>
                    <td className="px-4 py-3 text-right font-mono">{brlCents(c.spent)}</td>
                    <td className="px-4 py-3">
                      {format(parseISO(c.last), "dd/MM/yyyy HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
