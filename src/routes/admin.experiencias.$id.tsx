import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Upload, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { ExperienceService } from "@/lib/services/experience-service";
import { StorageService, type ExperienceMediaKind } from "@/lib/services/storage-service";
import {
  EXPERIENCE_BADGES,
  EXPERIENCE_LEVELS,
  VIDEO_KIND_LABEL,
  slugify,
  type Experience,
  type ExperienceExtraVideo,
  type ExperienceGalleryItem,
  type ExperienceVideoKind,
  type POI,
} from "@/lib/experiences";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TourService } from "@/lib/services/tour-service";

export const Route = createFileRoute("/admin/experiencias/$id")({
  component: AdminExperienciaEdit,
});

type FormState = Omit<Experience, "created_at" | "updated_at" | "category">;

const EMPTY: FormState = {
  id: "",
  slug: "",
  name: "",
  short_description: "",
  description: "",
  category_id: null,
  level: "Leve",
  duration_hours: 2,
  distance_km: 10,
  altitude_m: 400,
  price_cents: 19900,
  max_people: 4,
  cover_image_url: null,
  horizontal_image_url: null,
  vertical_image_url: null,
  preview_video_url: null,
  main_video_url: null,
  drone_video_url: null,
  onboard_video_url: null,
  video_360_url: null,
  route_map_url: null,
  equipment: [],
  what_to_bring: [],
  curiosities: [],
  points_of_interest: [],
  badge: null,
  tour_slug: null,
  seo_title: null,
  seo_description: null,
  og_image_url: null,
  status: "DRAFT",
  popularity: 0,
  sort_order: 0,
  vehicle_type_ids: [],
  tags: [],
  gallery: [],
  videos: [],
};

function AdminExperienciaEdit() {
  console.log("ROTA EDIT ABERTA");
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: cats = [] } = useQuery({
    queryKey: ["exp", "categories"],
    queryFn: () => ExperienceService.listCategories(),
  });
  const { data: vehicles = [] } = useQuery({
    queryKey: ["exp", "vehicles"],
    queryFn: () => ExperienceService.listVehicleTypes(),
  });

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin", "experience", id],
    queryFn: () => (isNew ? Promise.resolve(null) : ExperienceService.getById(id)),
  });

  const [form, setForm] = useState<FormState>(EMPTY);
  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    if (existing) {
      setForm({ ...(existing as unknown as FormState) });
      setTagsInput(existing.tags.join(", "));
    } else if (isNew) {
      setForm(EMPTY);
    }
  }, [existing, isNew]);

  const save = useMutation({
    mutationFn: async (payload: FormState) => {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      return ExperienceService.upsert({ ...payload, tags });
    },
    onSuccess: (newId) => {
      toast.success("Salvo com sucesso");
      qc.invalidateQueries({ queryKey: ["admin", "experiences"] });
      qc.invalidateQueries({ queryKey: ["exp"] });
      if (isNew) navigate({ to: "/admin/experiencias/$id", params: { id: newId } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erro ao salvar"),
  });

  if (!isNew && isLoading) return <p className="text-sm">Carregando…</p>;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/admin/experiencias"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <button onClick={() => save.mutate(form)} disabled={save.isPending} className="btn-brand text-xs">
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
        </button>
      </div>

      <div>
        <h1 className="font-display text-3xl uppercase tracking-wide">
          {isNew ? "Nova experiência" : form.name || "Editar experiência"}
        </h1>
      </div>

      {/* Informações básicas */}
      <Section title="Informações básicas">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nome">
            <Input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                set("name", name);
                if (!form.slug || form.slug === slugify(form.name)) set("slug", slugify(name));
              }}
            />
          </Field>
          <Field label="Slug (URL)">
            <Input value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
          </Field>
          <Field label="Descrição curta" className="md:col-span-2">
            <Textarea
              rows={2}
              value={form.short_description ?? ""}
              onChange={(e) => set("short_description", e.target.value)}
            />
          </Field>
          <Field label="Descrição completa" className="md:col-span-2">
            <Textarea rows={6} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Categoria">
            <select
              value={form.category_id ?? ""}
              onChange={(e) => set("category_id", e.target.value || null)}
              className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nível">
            <select
              value={form.level}
              onChange={(e) => set("level", e.target.value as FormState["level"])}
              className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm"
            >
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Duração (horas)">
            <Input
              type="number"
              step="0.5"
              value={form.duration_hours}
              onChange={(e) => set("duration_hours", Number(e.target.value))}
            />
          </Field>
          <Field label="Distância (km)">
            <Input
              type="number"
              step="0.1"
              value={form.distance_km}
              onChange={(e) => set("distance_km", Number(e.target.value))}
            />
          </Field>
          <Field label="Altitude (m)">
            <Input type="number" value={form.altitude_m} onChange={(e) => set("altitude_m", Number(e.target.value))} />
          </Field>
          <Field label="Preço (centavos R$)">
            <Input
              type="number"
              value={form.price_cents}
              onChange={(e) => set("price_cents", Number(e.target.value))}
            />
          </Field>
          <Field label="Máx. pessoas">
            <Input type="number" value={form.max_people} onChange={(e) => set("max_people", Number(e.target.value))} />
          </Field>
          <Field label="Selo">
            <select
              value={form.badge ?? ""}
              onChange={(e) => set("badge", (e.target.value || null) as FormState["badge"])}
              className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {EXPERIENCE_BADGES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value as FormState["status"])}
              className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm"
            >
              <option value="PUBLISHED">Publicado</option>
              <option value="DRAFT">Rascunho</option>
              <option value="COMING_SOON">Em breve</option>
            </select>
          </Field>
          {/* Campo "Passeio para reserva (tour)" removido: a experiência é
              reservável diretamente por slug/ID, sem vínculo com Passeios. */}

          <Field label="Ordem">
            <Input type="number" value={form.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} />
          </Field>
          <Field label="Popularidade">
            <Input type="number" value={form.popularity} onChange={(e) => set("popularity", Number(e.target.value))} />
          </Field>
        </div>
      </Section>

      {/* Veículos e tags */}
      <Section title="Veículos permitidos & Tags">
        <div className="flex flex-wrap gap-2">
          {vehicles.map((v) => {
            const active = form.vehicle_type_ids.includes(v.id);
            return (
              <button
                key={v.id}
                type="button"
                onClick={() =>
                  set(
                    "vehicle_type_ids",
                    active ? form.vehicle_type_ids.filter((i) => i !== v.id) : [...form.vehicle_type_ids, v.id],
                  )
                }
                className={`rounded-full border px-4 py-1.5 text-xs font-mono uppercase tracking-wider ${active ? "border-brand bg-brand text-brand-foreground" : "border-border/60"}`}
              >
                {v.name}
              </button>
            );
          })}
        </div>
        <Field label="Tags (separadas por vírgula)" className="mt-4">
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="cachoeira, drone, familia"
          />
        </Field>
      </Section>

      {/* Imagens */}
      <Section title="Hero & Imagens principais">
        <div className="grid gap-4 md:grid-cols-3">
          <MediaImage
            label="Capa"
            kind="cover"
            url={form.cover_image_url}
            onChange={(u) => set("cover_image_url", u)}
          />

          <MediaImage
            label="Horizontal"
            kind="horizontal"
            url={form.horizontal_image_url}
            onChange={(u) => set("horizontal_image_url", u)}
          />

          <MediaImage
            label="Vertical"
            kind="vertical"
            url={form.vertical_image_url}
            onChange={(u) => set("vertical_image_url", u)}
          />

          <MediaImage
            label="Mapa da rota"
            kind="map"
            url={form.route_map_url}
            onChange={(u) => set("route_map_url", u)}
          />
        </div>
      </Section>

      {/* Vídeos principais */}
      <Section title="Vídeos principais">
        <div className="grid gap-4 md:grid-cols-2">
          <VideoField
            label="Vídeo principal"
            kind="main"
            url={form.main_video_url}
            onChange={(u) => set("main_video_url", u)}
          />
          <VideoField
            label="Preview (autoplay hover)"
            kind="preview"
            url={form.preview_video_url}
            onChange={(u) => set("preview_video_url", u)}
          />
          <VideoField
            label="Drone"
            kind="drone"
            url={form.drone_video_url}
            onChange={(u) => set("drone_video_url", u)}
          />
          <VideoField
            label="Onboard / GoPro"
            kind="onboard"
            url={form.onboard_video_url}
            onChange={(u) => set("onboard_video_url", u)}
          />
          <VideoField label="360°" kind="video360" url={form.video_360_url} onChange={(u) => set("video_360_url", u)} />
        </div>
      </Section>

      {/* Galeria */}
      <Section title="Galeria">
        <GalleryEditor items={form.gallery} onChange={(g) => set("gallery", g)} />
      </Section>

      {/* Vídeos extras */}
      <Section title="Vídeos extras">
        <ExtraVideosEditor items={form.videos} onChange={(v) => set("videos", v)} />
      </Section>

      {/* Listas dinâmicas */}
      <Section title="Detalhes">
        <div className="grid gap-6 md:grid-cols-2">
          <ListEditor label="Equipamentos inclusos" items={form.equipment} onChange={(v) => set("equipment", v)} />
          <ListEditor label="O que levar" items={form.what_to_bring} onChange={(v) => set("what_to_bring", v)} />
          <ListEditor label="Curiosidades" items={form.curiosities} onChange={(v) => set("curiosities", v)} />
          <POIEditor items={form.points_of_interest} onChange={(v) => set("points_of_interest", v)} />
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO & Compartilhamento">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Título SEO">
            <Input value={form.seo_title ?? ""} onChange={(e) => set("seo_title", e.target.value)} />
          </Field>
          <Field label="Descrição SEO">
            <Input value={form.seo_description ?? ""} onChange={(e) => set("seo_description", e.target.value)} />
          </Field>
          <MediaImage
            label="Imagem Open Graph"
            kind="cover"
            url={form.og_image_url}
            onChange={(u) => set("og_image_url", u)}
          />
          <div className="rounded-xl border border-border/60 bg-background overflow-hidden">
            <div className="aspect-[1.91/1] w-full bg-muted overflow-hidden">
              {form.og_image_url || form.cover_image_url ? (
                <img
                  src={form.og_image_url ?? form.cover_image_url ?? ""}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sem imagem</div>
              )}
            </div>
            <div className="p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Preview</p>
              <p className="mt-1 font-medium truncate">{form.seo_title || form.name || "Título"}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {form.seo_description || form.short_description || "Descrição"}
              </p>
            </div>
          </div>
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={() => save.mutate(form)} disabled={save.isPending} className="btn-brand text-sm">
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar experiência"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 md:p-6">
      <h2 className="mb-4 font-display text-xl uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function MediaImage({
  label,
  kind,
  url,
  onChange,
}: {
  label: string;
  kind: ExperienceMediaKind;
  url: string | null;
  onChange: (u: string | null) => void;
}) {
  return (
    <ImageUpload
      label={label}
      value={url}
      onChange={onChange}
      upload={(f) => StorageService.uploadExperienceMedia(f, kind)}
    />
  );
}

function VideoField({
  label,
  kind,
  url,
  onChange,
}: {
  label: string;
  kind: ExperienceMediaKind;
  url: string | null;
  onChange: (u: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const onFile = async (f: File) => {
    if (!f.type.startsWith("video/")) return toast.error("Selecione um vídeo");
    if (f.size > 50 * 1024 * 1024) return toast.error("Máx. 50 MB por vídeo");
    setUploading(true);
    try {
      const u = await StorageService.uploadExperienceMedia(f, kind);
      onChange(u);
      toast.success("Vídeo enviado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      {url ? (
        <div className="rounded-xl border border-border/60 bg-black overflow-hidden">
          <video src={url} controls className="aspect-video w-full" />
          <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-card p-2">
            <span className="truncate text-xs text-muted-foreground">Vídeo salvo</span>
            <button onClick={() => onChange(null)} className="text-xs text-destructive">
              Remover
            </button>
          </div>
        </div>
      ) : (
        <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 hover:border-brand/60">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {uploading ? "Enviando…" : "Selecionar vídeo"}
          </span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </label>
      )}
    </div>
  );
}

function ListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  const [val, setVal] = useState("");
  return (
    <div>
      <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Adicionar item" />
        <button
          type="button"
          onClick={() => {
            if (val.trim()) onChange([...items, val.trim()]);
            setVal("");
          }}
          className="btn-outline-brand text-xs"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <ul className="mt-3 space-y-1">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-center gap-2 rounded-md border border-border/60 bg-background px-3 py-2 text-sm"
          >
            <span className="flex-1">{it}</span>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function POIEditor({ items, onChange }: { items: POI[]; onChange: (v: POI[]) => void }) {
  return (
    <div>
      <Label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Pontos turísticos
      </Label>
      <div className="space-y-2">
        {items.map((p, i) => (
          <div key={i} className="rounded-md border border-border/60 bg-background p-3">
            <div className="flex items-center gap-2">
              <Input
                value={p.name}
                onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                placeholder="Nome"
              />
              <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Textarea
              className="mt-2"
              rows={2}
              value={p.description ?? ""}
              onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))}
              placeholder="Descrição"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, { name: "", description: "" }])}
        className="mt-2 btn-outline-brand text-xs"
      >
        <Plus className="h-4 w-4" /> Adicionar ponto
      </button>
    </div>
  );
}

function GalleryEditor({
  items,
  onChange,
}: {
  items: ExperienceGalleryItem[];
  onChange: (v: ExperienceGalleryItem[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const addFiles = async (files: FileList) => {
    setUploading(true);
    try {
      const uploaded: ExperienceGalleryItem[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const url = await StorageService.uploadExperienceMedia(file, "gallery");
        uploaded.push({ id: crypto.randomUUID(), url, caption: null, sort_order: items.length + uploaded.length });
      }
      if (uploaded.length) onChange([...items, ...uploaded]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setUploading(false);
    }
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next.map((x, k) => ({ ...x, sort_order: k })));
  };
  return (
    <div>
      <label
        className="flex h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 hover:border-brand/60"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) void addFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin text-brand" />
        ) : (
          <Plus className="h-5 w-5 text-muted-foreground" />
        )}
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {uploading ? "Enviando…" : "Adicionar imagens (múltiplas)"}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </label>
      {items.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {items.map((g, i) => (
            <div key={g.id} className="rounded-lg border border-border/60 overflow-hidden bg-background">
              <div className="relative">
                <img src={g.url} alt="" className="aspect-square w-full object-cover" />
                <div className="absolute right-1 top-1 flex gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded-full bg-black/70 p-1 text-white hover:text-brand disabled:opacity-40"
                    title="Mover para cima"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                    className="rounded-full bg-black/70 p-1 text-white hover:text-brand disabled:opacity-40"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onChange(items.filter((_, j) => j !== i).map((x, k) => ({ ...x, sort_order: k })))}
                    className="rounded-full bg-black/70 p-1 text-white hover:text-destructive"
                    title="Remover"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <Input
                value={g.caption ?? ""}
                onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))}
                placeholder="Legenda"
                className="h-8 rounded-none border-0 border-t border-border/60 text-xs"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const VIDEO_KIND_TO_STORAGE: Record<ExperienceVideoKind, ExperienceMediaKind> = {
  drone: "drone",
  onboard: "onboard",
  helmet: "main",
  side: "main",
  "360": "video360",
  extra: "main",
};

function ExtraVideosEditor({
  items,
  onChange,
}: {
  items: ExperienceExtraVideo[];
  onChange: (v: ExperienceExtraVideo[]) => void;
}) {
  const [uploading, setUploading] = useState<ExperienceVideoKind | null>(null);
  const add = async (file: File, kind: ExperienceVideoKind) => {
    if (!file.type.startsWith("video/")) return toast.error("Selecione um vídeo");
    if (file.size > 50 * 1024 * 1024) return toast.error("Máx. 50 MB por vídeo");
    setUploading(kind);
    try {
      const url = await StorageService.uploadExperienceMedia(file, VIDEO_KIND_TO_STORAGE[kind]);
      onChange([...items, { id: crypto.randomUUID(), kind, url, label: null, sort_order: items.length }]);
      toast.success("Vídeo enviado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setUploading(null);
    }
  };
  const KINDS: ExperienceVideoKind[] = ["drone", "onboard", "helmet", "side", "360", "extra"];
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <label key={k} className="btn-outline-brand text-xs cursor-pointer">
            {uploading === k ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {VIDEO_KIND_LABEL[k]}
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && add(e.target.files[0], k)}
            />
          </label>
        ))}
      </div>
      {items.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((v, i) => (
            <div key={v.id} className="rounded-xl border border-border/60 bg-background overflow-hidden">
              <video src={v.url} controls className="aspect-video w-full" preload="metadata" />
              <div className="flex items-center gap-2 border-t border-border/60 p-2">
                <span className="flex-1 font-mono text-[10px] uppercase tracking-widest text-brand">
                  {VIDEO_KIND_LABEL[v.kind]}
                </span>
                <Input
                  value={v.label ?? ""}
                  onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  placeholder="Legenda"
                  className="h-8 text-xs"
                />
                <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
