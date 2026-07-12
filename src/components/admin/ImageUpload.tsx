import { useRef, useState, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  upload: (file: File) => Promise<string>;
  label?: string;
  className?: string;
};

/**
 * ImageUpload — drag-and-drop / click-to-select image uploader with preview,
 * remove and replace actions. Uploads via the provided `upload` fn.
 */
export function ImageUpload({ value, onChange, upload, label, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Selecione um arquivo de imagem.");
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast.error("A imagem deve ter até 8 MB.");
        return;
      }
      setUploading(true);
      try {
        const url = await upload(file);
        onChange(url);
        toast.success("Imagem enviada");
      } catch (e) {
        console.error(e);
        toast.error(e instanceof Error ? e.message : "Falha no upload");
      } finally {
        setUploading(false);
      }
    },
    [onChange, upload],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className={className}>
      {label && (
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          {label}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-card group">
          <img src={value} alt="Preview" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn-brand text-xs"
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Substituir
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="btn-outline-brand text-xs"
              disabled={uploading}
            >
              <X className="h-4 w-4" /> Remover
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          disabled={uploading}
          className={cn(
            "w-full h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors",
            dragging
              ? "border-brand bg-brand/5"
              : "border-border/60 hover:border-brand/60 bg-card",
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 text-brand animate-spin" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
            {uploading ? "Enviando..." : "Selecionar imagem"}
          </p>
          <p className="text-[10px] text-muted-foreground">Arraste e solte ou clique</p>
        </button>
      )}
    </div>
  );
}
