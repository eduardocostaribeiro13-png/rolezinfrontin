import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Copy, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import { ExperienceService } from "@/lib/services/experience-service";
import type { Experience } from "@/lib/experiences";
import { brlCents } from "@/lib/experiences";
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
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/experiencias/")({
  component: AdminExperiencias,
});

function AdminExperiencias() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "experiences"],
    queryFn: () => ExperienceService.listAllAdmin(),
  });
  const [deleting, setDeleting] = useState<Experience | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "experiences"] });

  const dup = useMutation({
    mutationFn: (id: string) => ExperienceService.duplicate(id),
    onSuccess: () => {
      toast.success("Experiência duplicada");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "PUBLISHED" | "DRAFT" }) =>
      ExperienceService.setStatus(id, status),
    onSuccess: () => {
      toast.success("Status atualizado");
      invalidate();
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => ExperienceService.remove(id),
    onSuccess: () => {
      toast.success("Experiência excluída");
      setDeleting(null);
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl uppercase tracking-wide">Experiências Off-Road</h1>
          <p className="text-sm text-muted-foreground">Gerencie o Centro de Experiências.</p>
        </div>
        <Link to="/admin/experiencias/$id" params={{ id: "new" }} className="btn-brand text-xs">
          <Plus className="h-4 w-4" /> Nova experiência
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
          <p className="font-display text-2xl">Nenhuma experiência cadastrada</p>
          <p className="mt-2 text-sm text-muted-foreground">Comece criando a primeira trilha.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3 hidden md:table-cell">Categoria</th>
                <th className="px-4 py-3 hidden md:table-cell">Preço</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((e) => (
                <tr key={e.id} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <p className="font-medium">{e.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">/{e.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">{e.category?.name ?? "—"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{brlCents(e.price_cents)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          setStatus.mutate({
                            id: e.id,
                            status: e.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
                          })
                        }
                        title={e.status === "PUBLISHED" ? "Despublicar" : "Publicar"}
                        className="rounded-md p-2 hover:bg-muted text-foreground/70 hover:text-brand"
                      >
                        {e.status === "PUBLISHED" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => dup.mutate(e.id)}
                        title="Duplicar"
                        className="rounded-md p-2 hover:bg-muted text-foreground/70 hover:text-brand"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <Link
                        to="/admin/experiencias/$id"
                        params={{ id: e.id }}
                        className="rounded-md p-2 hover:bg-muted text-foreground/70 hover:text-brand"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleting(e)}
                        title="Excluir"
                        className="rounded-md p-2 hover:bg-muted text-foreground/70 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir experiência?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá permanentemente "{deleting?.name}" e todos os vídeos/imagens/galeria vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && remove.mutate(deleting.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatusBadge({ status }: { status: Experience["status"] }) {
  const map = {
    PUBLISHED: { label: "Publicado", cls: "bg-brand/20 text-brand" },
    DRAFT: { label: "Rascunho", cls: "bg-muted text-muted-foreground" },
    COMING_SOON: { label: "Em breve", cls: "bg-yellow-500/20 text-yellow-500" },
  } as const;
  const s = map[status];
  return (
    <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${s.cls}`}>
      {s.label}
    </span>
  );
}
