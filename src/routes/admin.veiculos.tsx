import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Wrench } from "lucide-react";
import { AdminService, brlCents, type AdminVehicle } from "@/lib/services/admin-service";
import { StorageService } from "@/lib/services/storage-service";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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

export const Route = createFileRoute("/admin/veiculos")({
  component: AdminVeiculos,
});

type FormState = {
  id?: string;
  name: string;
  slug: string;
  type: string;
  capacity: number;
  status: string;
  sort_order: number;
  description: string;
  price_reais: number;
  image_url: string;
};

const EMPTY: FormState = {
  name: "",
  slug: "",
  type: "Quadriciclo",
  capacity: 2,
  status: "ACTIVE",
  sort_order: 0,
  description: "",
  price_reais: 0,
  image_url: "",
};

function AdminVeiculos() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: () => AdminService.listVehiclesAll(),
  });
  const [editing, setEditing] = useState<FormState | null>(null);
  const [deleting, setDeleting] = useState<AdminVehicle | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "vehicles"] });

  const saveMut = useMutation({
    mutationFn: (f: FormState) =>
      AdminService.upsertVehicle({
        id: f.id,
        name: f.name,
        slug: f.slug,
        type: f.type,
        capacity: f.capacity,
        status: f.status,
        sort_order: f.sort_order,
        description: f.description,
        price_cents: Math.round(f.price_reais * 100),
        image_url: f.image_url || null,
      }),
    onSuccess: () => {
      toast.success("Veículo salvo");
      invalidate();
      setEditing(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao salvar"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => AdminService.deleteVehicle(id),
    onSuccess: () => {
      toast.success("Veículo excluído");
      invalidate();
      setDeleting(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao excluir"),
  });

  const toEdit = (v: AdminVehicle): FormState => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    type: v.type,
    capacity: v.capacity,
    status: v.status,
    sort_order: v.sort_order,
    description: v.description ?? "",
    price_reais: v.price_cents / 100,
    image_url: v.image_url ?? "",
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="eyebrow">Frota</p>
          <h1 className="font-display text-4xl uppercase leading-none mt-2">Veículos</h1>
        </div>
        <button className="btn-brand text-xs" onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="h-4 w-4" /> Novo veículo
        </button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data ?? []).map((v) => (
            <div key={v.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
              {v.image_url && (
                <img
                  src={v.image_url}
                  alt={v.name}
                  className="w-full h-40 object-cover"
                  loading="lazy"
                />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-xl uppercase leading-none">{v.name}</p>
                    <p className="mt-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      {v.type} · até {v.capacity} pessoa(s)
                    </p>
                  </div>
                  <StatusPill status={v.status} />
                </div>
                {v.description && (
                  <p className="mt-3 text-xs text-foreground/70 line-clamp-2">{v.description}</p>
                )}
                <p className="mt-4 font-display text-brand text-2xl">
                  {brlCents(v.price_cents)}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setEditing(toEdit(v))}
                    className="btn-outline-brand text-xs flex-1"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleting(v)}
                    className="text-xs p-2 rounded-md border border-border/60 hover:border-destructive hover:text-destructive"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar veículo" : "Novo veículo"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMut.mutate(editing);
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome">
                  <Input
                    required
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  />
                </Field>
                <Field label="Slug">
                  <Input
                    required
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  />
                </Field>
                <Field label="Tipo">
                  <Input
                    required
                    value={editing.type}
                    onChange={(e) => setEditing({ ...editing, type: e.target.value })}
                  />
                </Field>
                <Field label="Capacidade">
                  <Input
                    type="number"
                    min={1}
                    required
                    value={editing.capacity}
                    onChange={(e) =>
                      setEditing({ ...editing, capacity: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Preço (R$)">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editing.price_reais}
                    onChange={(e) =>
                      setEditing({ ...editing, price_reais: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Ordem">
                  <Input
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) =>
                      setEditing({ ...editing, sort_order: Number(e.target.value) })
                    }
                  />
                </Field>
              </div>
              <Field label="Status">
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="MAINTENANCE">Em manutenção</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </Field>
              <div>
                <Label className="text-xs">Imagem do veículo</Label>
                <div className="mt-1">
                  <ImageUpload
                    value={editing.image_url || null}
                    onChange={(url) => setEditing({ ...editing, image_url: url ?? "" })}
                    upload={StorageService.uploadVehicleImage}
                  />
                </div>
              </div>
              <Field label="Descrição">
                <Textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </Field>
              <DialogFooter>
                <button
                  type="button"
                  className="btn-outline-brand text-xs"
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-brand text-xs" disabled={saveMut.isPending}>
                  Salvar
                </button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir veículo?</AlertDialogTitle>
            <AlertDialogDescription>
              Reservas existentes desse veículo ficarão sem vínculo. Preferimos marcar como
              "Em manutenção" para simplesmente esconder do site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && deleteMut.mutate(deleting.id)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    MAINTENANCE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    INACTIVE: "bg-muted text-muted-foreground border-border/60",
  };
  const labels: Record<string, string> = {
    ACTIVE: "Ativo",
    MAINTENANCE: "Manutenção",
    INACTIVE: "Inativo",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest ${styles[status] ?? styles.INACTIVE}`}
    >
      {status === "MAINTENANCE" && <Wrench className="h-3 w-3" />}
      {labels[status] ?? status}
    </span>
  );
}
