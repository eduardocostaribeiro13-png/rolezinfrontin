import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { TourService } from "@/lib/services/tour-service";
import { ExperienceService } from "@/lib/services/experience-service";
import { Link } from "@tanstack/react-router";


import { StorageService } from "@/lib/services/storage-service";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { brlCents, type Tour, type TourLevel } from "@/lib/tours";
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

export const Route = createFileRoute("/admin/passeios")({
  component: AdminPasseios,
});

type FormState = {
  id?: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  category: string;
  image_url: string;
  price_per_hour_reais: number;
  duration_hours: number;
  max_people: number;
  level: TourLevel;
  highlights: string;
  sort_order: number;
  status: "ACTIVE" | "INACTIVE";
};

const EMPTY: FormState = {
  slug: "",
  name: "",
  short_description: "",
  description: "",
  category: "Trilha",
  image_url: "",
  price_per_hour_reais: 199.9,
  duration_hours: 2,
  max_people: 4,
  level: "Leve",
  highlights: "",
  sort_order: 0,
  status: "ACTIVE",
};

const CATEGORIES = ["Trilha", "Cachoeira", "Pôr do Sol", "Dia inteiro", "Radical", "Família", "Outros"];

function AdminPasseios() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "tours"],
    queryFn: () => TourService.listAll(),
  });
  const { data: experiences, isLoading: loadingExp } = useQuery({
    queryKey: ["admin", "experiences", "passeios"],
    queryFn: () => ExperienceService.listAllAdmin(),
  });
  const [editing, setEditing] = useState<FormState | null>(null);
  const [deleting, setDeleting] = useState<Tour | null>(null);


  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "tours"] });
    qc.invalidateQueries({ queryKey: ["tours", "public"] });
  };

  const saveMut = useMutation({
    mutationFn: (f: FormState) =>
      TourService.upsert({
        id: f.id,
        slug: f.slug,
        name: f.name,
        short_description: f.short_description || null,
        description: f.description || null,
        category: f.category || null,
        image_url: f.image_url || null,
        price_per_hour_cents: Math.round(f.price_per_hour_reais * 100),
        duration_hours: f.duration_hours,
        max_people: f.max_people,
        level: f.level,
        highlights: f.highlights
          .split(/\r?\n|,/)
          .map((h) => h.trim())
          .filter(Boolean),
        sort_order: f.sort_order,
        status: f.status,
      }),
    onSuccess: () => {
      toast.success("Passeio salvo");
      invalidate();
      setEditing(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao salvar"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => TourService.remove(id),
    onSuccess: () => {
      toast.success("Passeio excluído");
      invalidate();
      setDeleting(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao excluir"),
  });

  const toEdit = (t: Tour): FormState => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    short_description: t.short_description ?? "",
    description: t.description ?? "",
    category: t.category ?? "",
    image_url: t.image_url ?? "",
    price_per_hour_reais: t.price_per_hour_cents / 100,
    duration_hours: t.duration_hours,
    max_people: t.max_people,
    level: t.level,
    highlights: t.highlights.join("\n"),
    sort_order: t.sort_order,
    status: t.status,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1 className="font-display text-4xl uppercase leading-none mt-2">Passeios</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Passeios exibidos no site. Todas as informações abaixo aparecem automaticamente nos cards públicos.
          </p>
        </div>
        <button className="btn-brand text-xs" onClick={() => setEditing({ ...EMPTY })}>
          <Plus className="h-4 w-4" /> Novo passeio
        </button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data ?? []).map((t) => (
            <div key={t.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
              {t.image_url ? (
                <img src={t.image_url} alt={t.name} className="w-full h-40 object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-40 bg-muted" />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-xl uppercase leading-none">{t.name}</p>
                    <p className="mt-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      {t.category ?? "—"} · {t.level}
                    </p>
                  </div>
                  <StatusPill status={t.status} />
                </div>
                {t.short_description && (
                  <p className="mt-3 text-xs text-foreground/70 line-clamp-2">{t.short_description}</p>
                )}
                <p className="mt-4 font-display text-brand text-2xl">
                  {brlCents(t.price_per_hour_cents)}
                  <span className="ml-1 text-[10px] font-mono uppercase text-muted-foreground">/ hora</span>
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setEditing(toEdit(t))}
                    className="btn-outline-brand text-xs flex-1"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleting(t)}
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

      <div className="pt-4">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <p className="eyebrow">Catálogo</p>
            <h2 className="font-display text-3xl uppercase leading-none mt-2">Experiências</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Experiências cadastradas no Centro de Experiências. Edite pela aba Experiências.
            </p>
          </div>
        </div>

        {loadingExp ? (
          <Skeleton className="mt-4 h-48 rounded-2xl" />
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(experiences ?? []).map((e) => (
              <div key={e.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                {e.cover_image_url ? (
                  <img src={e.cover_image_url} alt={e.name} className="w-full h-40 object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-40 bg-muted" />
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-xl uppercase leading-none">{e.name}</p>
                      <p className="mt-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        {e.category?.name ?? "—"} · {e.level}
                      </p>
                    </div>
                    <StatusPill status={e.status === "PUBLISHED" ? "ACTIVE" : "INACTIVE"} />
                  </div>
                  {e.short_description && (
                    <p className="mt-3 text-xs text-foreground/70 line-clamp-2">{e.short_description}</p>
                  )}
                  <p className="mt-4 font-display text-brand text-2xl">{brlCents(e.price_cents)}</p>
                  <div className="mt-4">
                    <Link
                      to="/admin/experiencias/$id"
                      params={{ id: e.id }}
                      className="btn-outline-brand text-xs w-full justify-center"
                    >
                      Editar experiência
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>



      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar passeio" : "Novo passeio"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMut.mutate(editing);
              }}
              className="space-y-3"
            >
              <div>
                <Label className="text-xs">Imagem principal</Label>
                <div className="mt-1">
                  <ImageUpload
                    value={editing.image_url || null}
                    onChange={(url) => setEditing({ ...editing, image_url: url ?? "" })}
                    upload={StorageService.uploadTourImage}
                  />
                </div>
              </div>

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
                <Field label="Categoria">
                  <select
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Nível">
                  <select
                    value={editing.level}
                    onChange={(e) => setEditing({ ...editing, level: e.target.value as TourLevel })}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="Leve">Leve</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Radical">Radical</option>
                  </select>
                </Field>
                <Field label="Valor por hora (R$)">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editing.price_per_hour_reais}
                    onChange={(e) => setEditing({ ...editing, price_per_hour_reais: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Duração (horas)">
                  <Input
                    type="number"
                    min={0.5}
                    step="0.5"
                    value={editing.duration_hours}
                    onChange={(e) => setEditing({ ...editing, duration_hours: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Máx. pessoas">
                  <Input
                    type="number"
                    min={1}
                    value={editing.max_people}
                    onChange={(e) => setEditing({ ...editing, max_people: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Ordem">
                  <Input
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <Field label="Status">
                <select
                  value={editing.status}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </Field>

              <Field label="Descrição curta">
                <Input
                  value={editing.short_description}
                  onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
                />
              </Field>

              <Field label="Descrição completa">
                <Textarea
                  rows={3}
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </Field>

              <Field label="Destaques (um por linha)">
                <Textarea
                  rows={3}
                  value={editing.highlights}
                  onChange={(e) => setEditing({ ...editing, highlights: e.target.value })}
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
            <AlertDialogTitle>Excluir passeio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Considere marcar como "Inativo" para ocultar do site.
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
    INACTIVE: "bg-muted text-muted-foreground border-border/60",
  };
  const labels: Record<string, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest ${styles[status] ?? styles.INACTIVE}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
