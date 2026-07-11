import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarX, Plus, Trash2 } from "lucide-react";
import { AdminService } from "@/lib/services/admin-service";
import { TimeSlotService } from "@/lib/services/time-slot-service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/agenda")({
  component: AdminAgenda,
});

function AdminAgenda() {
  const qc = useQueryClient();
  const blocks = useQuery({
    queryKey: ["admin", "blocked_slots"],
    queryFn: () => AdminService.listBlockedSlots(),
  });
  const vehicles = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: () => AdminService.listVehiclesAll(),
  });
  const slots = useQuery({
    queryKey: ["time_slots"],
    queryFn: () => TimeSlotService.list(),
  });

  const [form, setForm] = useState({
    vehicle_id: "",
    blocked_date: format(new Date(), "yyyy-MM-dd"),
    blocked_time: "",
    reason: "",
  });

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["admin", "blocked_slots"] });

  const addMut = useMutation({
    mutationFn: () =>
      AdminService.addBlockedSlot({
        vehicle_id: form.vehicle_id || null,
        blocked_date: form.blocked_date,
        blocked_time: form.blocked_time || null,
        reason: form.reason || null,
      }),
    onSuccess: () => {
      toast.success("Bloqueio criado");
      invalidate();
      setForm((f) => ({ ...f, reason: "", blocked_time: "" }));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha"),
  });

  const removeMut = useMutation({
    mutationFn: (id: string) => AdminService.removeBlockedSlot(id),
    onSuccess: () => {
      toast.success("Bloqueio removido");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha"),
  });

  const vehicleName = (id: string | null) =>
    id ? vehicles.data?.find((v) => v.id === id)?.name ?? "—" : "Todos os veículos";

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Operação</p>
        <h1 className="font-display text-4xl uppercase leading-none mt-2">Agenda</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bloqueie datas ou horários específicos. Deixe o horário em branco para bloquear o dia
          inteiro. Deixe o veículo em branco para bloquear todos.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addMut.mutate();
        }}
        className="rounded-2xl border border-border/60 bg-card p-5 grid gap-3 md:grid-cols-5"
      >
        <div>
          <Label className="text-xs">Veículo</Label>
          <select
            value={form.vehicle_id}
            onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
            className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">Todos</option>
            {(vehicles.data ?? []).map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-xs">Data</Label>
          <Input
            type="date"
            required
            value={form.blocked_date}
            onChange={(e) => setForm({ ...form, blocked_date: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Horário</Label>
          <select
            value={form.blocked_time}
            onChange={(e) => setForm({ ...form, blocked_time: e.target.value })}
            className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">Dia inteiro</option>
            {(slots.data ?? []).map((s) => (
              <option key={s.id} value={s.time}>
                {s.time}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <Label className="text-xs">Motivo</Label>
          <Input
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Manutenção, feriado..."
            className="mt-1"
          />
        </div>
        <div className="md:col-span-5">
          <button type="submit" className="btn-brand text-xs" disabled={addMut.isPending}>
            <Plus className="h-4 w-4" /> Bloquear
          </button>
        </div>
      </form>

      <div>
        <p className="eyebrow mb-3">Bloqueios ativos</p>
        {blocks.isLoading ? (
          <Skeleton className="h-64 rounded-2xl" />
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs font-mono uppercase tracking-widest text-muted-foreground bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-3">Data</th>
                    <th className="text-left px-4 py-3">Horário</th>
                    <th className="text-left px-4 py-3">Veículo</th>
                    <th className="text-left px-4 py-3">Motivo</th>
                    <th className="text-right px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {(blocks.data ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        <CalendarX className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        Nenhum bloqueio.
                      </td>
                    </tr>
                  )}
                  {(blocks.data ?? []).map((b) => (
                    <tr key={b.id} className="border-t border-border/40">
                      <td className="px-4 py-3">
                        {format(new Date(b.blocked_date + "T12:00:00"), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </td>
                      <td className="px-4 py-3">{b.blocked_time ?? "Dia inteiro"}</td>
                      <td className="px-4 py-3">{vehicleName(b.vehicle_id)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.reason ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => removeMut.mutate(b.id)}
                          className="p-1.5 rounded border border-border/60 hover:border-destructive hover:text-destructive"
                          aria-label="Remover"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
