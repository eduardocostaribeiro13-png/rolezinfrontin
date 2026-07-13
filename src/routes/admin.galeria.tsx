import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import { Trash2, Upload, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { GalleryService, type GalleryImage } from "@/lib/services/gallery-service";
import { StorageService } from "@/lib/services/storage-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const GALLERY_CATEGORIES = [
  "Quadriciclos",
  "UTVs",
  "Trilhas",
  "Passeios",
  "Clientes",
  "Eventos",
  "Cachoeiras",
  "Paisagens",
  "Outros",
] as const;

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export const Route = createFileRoute("/admin/galeria")({
  component: AdminGaleria,
});

function AdminGaleria() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "gallery"],
    queryFn: () => GalleryService.list(),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "gallery"] });

  const uploadMut = useMutation({
    mutationFn: async (files: FileList) => {
      const list = Array.from(files);
      const base = (data?.length ?? 0);
      for (let i = 0; i < list.length; i++) {
        const url = await StorageService.uploadGalleryImage(list[i]);
        await GalleryService.add({ image_url: url, sort_order: base + i });
      }
    },
    onSuccess: () => {
      toast.success("Imagens enviadas");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha no upload"),
  });

  const updateMut = useMutation({
    mutationFn: (p: { id: string; patch: Partial<GalleryImage> }) =>
      GalleryService.update(p.id, p.patch),
    onSuccess: invalidate,
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha ao salvar"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => GalleryService.remove(id),
    onSuccess: () => {
      toast.success("Imagem removida");
      invalidate();
    },
  });

  const move = (idx: number, dir: -1 | 1) => {
    if (!data) return;
    const other = idx + dir;
    if (other < 0 || other >= data.length) return;
    const a = data[idx];
    const b = data[other];
    updateMut.mutate({ id: a.id, patch: { sort_order: b.sort_order } });
    updateMut.mutate({ id: b.id, patch: { sort_order: a.sort_order } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="eyebrow">Fotos</p>
          <h1 className="font-display text-4xl uppercase leading-none mt-2">Galeria</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            As imagens abaixo aparecem automaticamente na página Galeria do site.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) uploadMut.mutate(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="btn-brand text-xs"
            disabled={uploadMut.isPending}
          >
            {uploadMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Enviar imagens
          </button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (data?.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma imagem ainda. Envie a primeira!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {data!.map((img, i) => (
            <div key={img.id} className="rounded-2xl border border-border/60 bg-card overflow-hidden">
              <img src={img.image_url} alt={img.alt_text ?? ""} className="w-full h-40 object-cover" />
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  <span className="truncate">{img.alt_text || "Sem título"}</span>
                  <span>{fmtDate(img.created_at)}</span>
                </div>
                <select
                  value={img.category ?? ""}
                  onChange={(e) =>
                    updateMut.mutate({
                      id: img.id,
                      patch: { category: e.target.value || null },
                    })
                  }
                  className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs"
                >
                  <option value="">Sem categoria</option>
                  {GALLERY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <Input
                  placeholder="Título / descrição"
                  defaultValue={img.alt_text ?? ""}
                  onBlur={(e) =>
                    e.target.value !== (img.alt_text ?? "") &&
                    updateMut.mutate({
                      id: img.id,
                      patch: { alt_text: e.target.value || null },
                    })
                  }
                  className="h-8 text-xs"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    className="text-xs p-2 rounded-md border border-border/60 hover:border-brand"
                    aria-label="Subir"
                    disabled={i === 0}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    className="text-xs p-2 rounded-md border border-border/60 hover:border-brand"
                    aria-label="Descer"
                    disabled={i === (data!.length - 1)}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Remover esta imagem?")) deleteMut.mutate(img.id);
                    }}
                    className="ml-auto text-xs p-2 rounded-md border border-border/60 hover:border-destructive hover:text-destructive"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
