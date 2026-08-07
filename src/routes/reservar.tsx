import { createFileRoute } from "@tanstack/react-router";
import { cloneElement, isValidElement, useEffect, useId, useMemo, useState, type ReactElement } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Calendar as CalIcon,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { brl, brlCents } from "@/lib/tours";
import { useQuery } from "@tanstack/react-query";
import { ExperienceService } from "@/lib/services/experience-service";
import { AdminService } from "@/lib/services/admin-service";
import { slugify, type Experience } from "@/lib/experiences";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { requestReservation } from "@/lib/reservation-request.functions";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";
import {
  useFullyBookedDates,
  useTakenTimes,
  useTimeSlots,
  useVehicles,
} from "@/lib/hooks/use-availability";
import type { Vehicle } from "@/lib/services/vehicle-service";

const searchSchema = z.object({
  experience: z.string().optional(),
  tour: z.string().optional(),
});

export const Route = createFileRoute("/reservar")({
  head: () => ({
    meta: [
      { title: "Reservar Experiência — Rolezin Frontin Off Road" },
      {
        name: "description",
        content:
          "Reserve sua experiência off-road em Engenheiro Paulo de Frontin. Escolha veículo, data e horário e finalize pelo WhatsApp.",
      },
    ],
    links: [{ rel: "canonical", href: "/reservar" }],
  }),
  validateSearch: searchSchema,
  component: ReservarPage,
});

const STEPS = ["Experiência", "Veículo", "Data", "Horário", "Dados", "Revisão"] as const;


const clientSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo").max(100),
  telefone: z.string().trim().min(8, "Telefone inválido").max(20),
  whatsapp: z.string().trim().min(8, "WhatsApp inválido").max(20),
  email: z.string().trim().email("E-mail inválido").max(150),
  cidade: z.string().trim().min(2, "Informe a cidade").max(80),
  estado: z.string().trim().min(2, "UF").max(2, "Use a sigla, ex: RJ"),
  observacoes: z.string().max(500).optional(),
});

type Cliente = z.infer<typeof clientSchema>;

function toISODate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function ReservarPage() {
  const { experience: initialSlug } = Route.useSearch();
  const [step, setStep] = useState(initialSlug ? 1 : 0);
  const [exp, setExp] = useState<Experience | null>(null);

  // Pré-seleção via ?experience=slug — carrega a experiência completa
  // (inclui vehicle_type_ids para filtrar os veículos).
  const { data: preselected } = useQuery({
    queryKey: ["experience", "by-slug", initialSlug],
    queryFn: () => ExperienceService.getBySlug(initialSlug!),
    enabled: !!initialSlug,
    staleTime: 60_000,
  });
  useEffect(() => {
    if (!exp && preselected && preselected.status === "PUBLISHED") setExp(preselected);
  }, [preselected, exp]);

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [cliente, setCliente] = useState<Cliente>({
    nome: "", telefone: "", whatsapp: "", email: "", cidade: "", estado: "", observacoes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Cliente, string>>>({});

  useEffect(() => {
    setTime(null);
  }, [vehicle?.id, date]);

  const { data: settings } = useQuery({
    queryKey: ["site-settings", "public"],
    queryFn: () => AdminService.getSettings(),
    staleTime: 300_000,
  });

  // Fonte única de preço/duração: a própria experiência (dados do banco).
  const hours = exp?.duration_hours ?? 1;
  const total = useMemo(() => (exp ? exp.price_cents / 100 : 0), [exp]);
  const pricePerHour = useMemo(
    () => (hours > 0 ? total / hours : 0),
    [total, hours],
  );
  const quantity = vehicle?.capacity ?? exp?.max_people ?? 1;

  const canAdvance = () => {
    if (step === 0) return !!exp;
    if (step === 1) return !!vehicle;
    if (step === 2) return !!date;
    if (step === 3) return !!time;
    if (step === 4) {
      const r = clientSchema.safeParse(cliente);
      if (!r.success) {
        const errs: Partial<Record<keyof Cliente, string>> = {};
        r.error.issues.forEach((i) => (errs[i.path[0] as keyof Cliente] = i.message));
        setErrors(errs);
        return false;
      }
      setErrors({});
      return true;
    }
    return true;
  };

  const next = () => canAdvance() && setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submitRequest = useServerFn(requestReservation);
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    if (submitting) return;
    if (!exp || !vehicle || !date || !time) {
      toast.error("Complete todas as etapas antes de solicitar.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitRequest({
        data: {
          experience_slug: exp.slug,
          vehicle_id: vehicle.id,
          reservation_date: toISODate(date),
          reservation_time: time,
          customer_name: cliente.nome,
          customer_email: cliente.email,
          customer_phone: cliente.telefone,
          customer_whatsapp: cliente.whatsapp,
          customer_city: cliente.cidade,
          customer_state: cliente.estado,
          notes: cliente.observacoes,
        },
      });

      const message = buildWhatsAppMessage({
        experienceName: res.experience_name,
        vehicleName: res.vehicle_name,
        date,
        time,
        hours: res.duration_hours,
        quantity: res.quantity,
        totalCents: res.total_cents,
        cliente,
      });
      const phone = (settings?.whatsapp || WHATSAPP_NUMBER).replace(/\D/g, "");
      toast.success("Solicitação registrada! Aguardando confirmação da equipe.");
      window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer",
      );
      setSubmitting(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("acabou de ser reservado") || msg.includes("indisponível")) {
        toast.error(msg);
        setTime(null);
        setStep(3);
      } else {
        toast.error("Não foi possível registrar a solicitação. Tente novamente.");
      }
      setSubmitting(false);
    }
  };


  return (
    <div className="pt-32 pb-24">
      <div className="container-x">
        <span className="eyebrow mb-4">Reserva</span>
        <h1 className="font-display text-5xl md:text-6xl uppercase leading-none">
          Sua aventura em <span className="text-brand">6 passos.</span>
        </h1>

        <div className="mt-10 flex items-center gap-2 overflow-x-auto pb-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <div
                className={cn(
                  "h-8 w-8 rounded-full grid place-items-center text-xs font-mono border transition-colors",
                  i < step && "bg-brand text-brand-foreground border-brand",
                  i === step && "border-brand text-brand",
                  i > step && "border-border/60 text-muted-foreground",
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span className={cn("text-xs font-mono uppercase tracking-widest", i === step ? "text-brand" : "text-muted-foreground")}>
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-border/60" />}
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px] items-start">
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && <StepExperience selected={exp} onSelect={setExp} />}
                {step === 1 && (
                  <StepVehicle
                    selected={vehicle}
                    onSelect={setVehicle}
                    allowedTypeIds={exp?.vehicle_type_ids ?? []}
                  />
                )}
                {step === 2 && (
                  <StepDate
                    date={date}
                    onChange={setDate}
                    vehicleId={vehicle?.id ?? null}
                  />
                )}
                {step === 3 && (
                  <StepTime
                    time={time}
                    onChange={setTime}
                    vehicleId={vehicle?.id ?? null}
                    date={date ?? null}
                  />
                )}
                {step === 4 && <StepClient value={cliente} onChange={setCliente} errors={errors} />}
                {step === 5 && (
                  <StepReview
                    exp={exp!}
                    vehicle={vehicle!}
                    date={date!}
                    time={time!}
                    quantity={quantity}
                    total={total}
                    cliente={cliente}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex justify-between">
              <button
                onClick={back}
                disabled={step === 0}
                className="btn-outline-brand text-xs disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              {step < STEPS.length - 1 ? (
                <button onClick={next} className="btn-brand text-xs">
                  Continuar <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button onClick={confirm} disabled={submitting} type="button" className="btn-brand text-xs disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                  {submitting ? "Enviando solicitação..." : "Solicitar reserva pelo WhatsApp"}
                </button>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 p-6 rounded-2xl border border-border/60 bg-card">
            <p className="eyebrow mb-4">Resumo</p>
            <dl className="space-y-3 text-sm">
              <Row k="Experiência" v={exp?.name ?? "—"} />
              <Row k="Veículo" v={vehicle?.name ?? "—"} />
              <Row k="Data" v={date ? format(date, "dd/MM/yyyy") : "—"} />
              <Row k="Horário" v={time ?? "—"} />
              <Row k="Duração" v={exp ? `${hours}h` : "—"} />
              <Row k="Participantes" v={vehicle ? `Até ${vehicle.capacity}` : "—"} />

              <Row k="Valor por hora" v={pricePerHour > 0 ? brl(pricePerHour) : "—"} />
              <Row k="Subtotal" v={brl(total)} />
              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Total</dt>
                <dd className="font-display text-3xl text-brand">{brl(total)}</dd>
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {hours}h × {brl(pricePerHour)}
              </p>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-foreground text-right">{v}</dd>
    </div>
  );
}

/* ---------- Steps ---------- */
function StepExperience({
  selected,
  onSelect,
}: {
  selected: Experience | null;
  onSelect: (e: Experience) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["experiences", "published"],
    queryFn: () => ExperienceService.listPublished(),
    staleTime: 60_000,
  });
  return (
    <div>
      <h2 className="font-display text-3xl uppercase">Escolha a experiência</h2>
      {isLoading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {(data ?? []).map((t) => {
            const isActive = selected?.slug === t.slug;
            const img = t.horizontal_image_url || t.cover_image_url;
            return (
              <button
                key={t.slug}
                onClick={() => onSelect(t)}
                className={cn(
                  "text-left rounded-2xl overflow-hidden border transition-all",
                  isActive ? "border-brand ring-2 ring-brand/40" : "border-border/60 hover:border-brand/60",
                )}
              >
                <div className="relative aspect-[16/10]">
                  {img ? (
                    <img src={img} alt={t.name} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                    <div>
                      <p className="font-display text-xl uppercase leading-none">{t.name}</p>
                      <p className="text-xs text-foreground/80 mt-1">{t.level}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-brand text-lg block leading-none">{brlCents(t.price_cents)}</span>
                      <span className="text-[10px] font-mono uppercase text-foreground/70">{t.duration_hours}h</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepVehicle({
  selected,
  onSelect,
  allowedTypeIds,
}: {
  selected: Vehicle | null;
  onSelect: (v: Vehicle) => void;
  allowedTypeIds: string[];
}) {
  const { data, isLoading, error } = useVehicles();
  const { data: types } = useQuery({
    queryKey: ["experience-vehicle-types"],
    queryFn: () => ExperienceService.listVehicleTypes(),
    staleTime: 300_000,
  });

  // Filtra os veículos pelos tipos permitidos na experiência.
  // O casamento é feito por slug (ou nome normalizado) do tipo.
  const list = useMemo(() => {
    const vehicles = data ?? [];
    if (!allowedTypeIds.length || !types?.length) return vehicles;
    const allowed = new Set(
      types
        .filter((t) => allowedTypeIds.includes(t.id))
        .flatMap((t) => [t.slug, slugify(t.name)]),
    );
    if (!allowed.size) return vehicles;
    const filtered = vehicles.filter((v) =>
      [v.slug, slugify(v.name), slugify(v.type)].some((k) => allowed.has(k)),
    );
    // Fallback seguro: se nada casar, não bloqueia a reserva.
    return filtered.length ? filtered : vehicles;
  }, [data, types, allowedTypeIds]);

  return (
    <div>
      <h2 className="font-display text-3xl uppercase flex items-center gap-2">
        <Car className="h-6 w-6 text-brand" /> Escolha o veículo
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Cada veículo tem apenas 1 unidade disponível. A capacidade máxima já está inclusa na experiência.
      </p>

      {isLoading && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      )}
      {error && (
        <p className="mt-6 text-sm text-destructive">Não foi possível carregar os veículos.</p>
      )}
      {data && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {list.map((v) => {
            const isActive = selected?.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onSelect(v)}
                className={cn(
                  "p-5 rounded-2xl border text-left transition-all",
                  isActive ? "border-brand ring-2 ring-brand/40" : "border-border/60 hover:border-brand/60",
                )}
              >
                <p className="font-display text-xl uppercase leading-none">{v.name}</p>
                <p className="mt-2 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Até {v.capacity} pessoa(s)
                </p>
                <p className="mt-4 text-xs text-foreground/70">{v.type}</p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


function StepDate({
  date,
  onChange,
  vehicleId,
}: {
  date?: Date;
  onChange: (d?: Date) => void;
  vehicleId: string | null;
}) {
  const from = useMemo(() => new Date(), []);
  const to = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 120);
    return d;
  }, []);
  const { data: bookedDates } = useFullyBookedDates(
    vehicleId,
    toISODate(from),
    toISODate(to),
  );
  const bookedSet = useMemo(() => new Set(bookedDates ?? []), [bookedDates]);

  return (
    <div>
      <h2 className="font-display text-3xl uppercase flex items-center gap-2">
        <CalIcon className="h-6 w-6 text-brand" /> Escolha a data
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Dias esgotados aparecem desabilitados no calendário.
      </p>
      <div className="mt-6 inline-block rounded-2xl border border-border/60 bg-card p-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          disabled={(d) => {
            if (d < new Date(new Date().setHours(0, 0, 0, 0))) return true;
            return bookedSet.has(toISODate(d));
          }}
          locale={ptBR}
          className={cn("pointer-events-auto")}
        />
      </div>
    </div>
  );
}

function StepTime({
  time,
  onChange,
  vehicleId,
  date,
}: {
  time: string | null;
  onChange: (t: string) => void;
  vehicleId: string | null;
  date: Date | null;
}) {
  const { data: slots, isLoading: loadingSlots } = useTimeSlots();
  const dateISO = date ? toISODate(date) : null;
  const { data: taken, isLoading: loadingTaken } = useTakenTimes(vehicleId, dateISO);
  const takenSet = useMemo(() => new Set(taken ?? []), [taken]);
  const isLoading = loadingSlots || loadingTaken;

  return (
    <div>
      <h2 className="font-display text-3xl uppercase flex items-center gap-2">
        <Clock className="h-6 w-6 text-brand" /> Escolha o horário
      </h2>

      {isLoading && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      )}

      {!isLoading && slots && slots.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          Não há horários disponíveis nesta data.
        </p>
      )}

      {!isLoading && slots && slots.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {slots.map((slot) => {
            const isTaken = takenSet.has(slot.time);
            const isActive = time === slot.time;
            return (
              <button
                key={slot.id}
                onClick={() => !isTaken && onChange(slot.time)}
                disabled={isTaken}
                className={cn(
                  "py-6 rounded-2xl border font-display text-2xl transition-all relative",
                  isActive && !isTaken && "border-brand bg-brand text-brand-foreground",
                  !isActive && !isTaken && "border-border/60 hover:border-brand/60",
                  isTaken && "border-border/40 bg-muted/30 text-muted-foreground/60 cursor-not-allowed opacity-60",
                )}
              >
                {slot.time}
                {isTaken && (
                  <span className="block mt-1 text-[10px] font-mono uppercase tracking-widest text-destructive">
                    Esgotado
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StepClient({
  value, onChange, errors,
}: {
  value: Cliente; onChange: (c: Cliente) => void; errors: Partial<Record<keyof Cliente, string>>;
}) {
  const set = <K extends keyof Cliente>(k: K, v: Cliente[K]) => onChange({ ...value, [k]: v });
  return (
    <div>
      <h2 className="font-display text-3xl uppercase">Seus dados</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Nome completo *" error={errors.nome}>
          <Input value={value.nome} onChange={(e) => set("nome", e.target.value)} />
        </Field>
        <Field label="E-mail *" error={errors.email}>
          <Input type="email" value={value.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label="Telefone *" error={errors.telefone}>
          <Input value={value.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(21) 90000-0000" />
        </Field>
        <Field label="WhatsApp *" error={errors.whatsapp}>
          <Input value={value.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="(21) 90000-0000" />
        </Field>
        <Field label="Cidade *" error={errors.cidade}>
          <Input value={value.cidade} onChange={(e) => set("cidade", e.target.value)} />
        </Field>
        <Field label="Estado (UF) *" error={errors.estado}>
          <Input value={value.estado} onChange={(e) => set("estado", e.target.value.toUpperCase())} maxLength={2} placeholder="RJ" />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Observações" error={errors.observacoes}>
            <Textarea value={value.observacoes} onChange={(e) => set("observacoes", e.target.value)} rows={4} />
          </Field>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  const id = useId();
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string }>, { id })
    : children;
  return (
    <div>
      <Label htmlFor={id} className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <div className="mt-2">{control}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function StepReview({
  exp, vehicle, date, time, quantity, total, cliente,
}: {
  exp: Experience; vehicle: Vehicle; date: Date; time: string; quantity: number; total: number; cliente: Cliente;
}) {
  return (
    <div>
      <h2 className="font-display text-3xl uppercase">Revise sua reserva</h2>
      <div className="mt-6 p-6 rounded-2xl border border-brand/50 bg-card">
        <div className="grid gap-6 sm:grid-cols-2">
          <Detail label="Experiência" value={exp.name} />
          <Detail label="Veículo" value={vehicle.name} />
          <Detail label="Data" value={format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} />
          <Detail label="Horário" value={time} />
          <Detail label="Participantes" value={`Até ${quantity} pessoa(s)`} />
          <Detail label="Nome" value={cliente.nome} />
          <Detail label="Contato" value={`${cliente.whatsapp} · ${cliente.email}`} />
          <Detail label="Cidade" value={`${cliente.cidade} / ${cliente.estado.toUpperCase()}`} />
          {cliente.observacoes && <Detail label="Observações" value={cliente.observacoes} />}
        </div>
        <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Valor da experiência</span>
          <span className="font-display text-4xl text-brand">{brl(total)}</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Ao confirmar, sua solicitação fica registrada como <strong>aguardando confirmação</strong> e
        o WhatsApp da equipe abre com todos os dados para finalizar o combinado.
      </p>
    </div>
  );
}

/** Monta a mensagem de WhatsApp com todos os dados da solicitação de reserva. */
function buildWhatsAppMessage(p: {
  experienceName: string;
  vehicleName: string;
  date: Date;
  time: string;
  hours: number;
  quantity: number;
  totalCents: number;
  cliente: Cliente;
}) {
  const lines = [
    "*NOVA SOLICITAÇÃO DE RESERVA — Rolezin Frontin Off Road*",
    "",
    `*Experiência:* ${p.experienceName}`,
    `*Veículo:* ${p.vehicleName}`,
    `*Data:* ${format(p.date, "dd/MM/yyyy", { locale: ptBR })}`,
    `*Horário:* ${p.time}`,
    `*Duração:* ${p.hours}h`,
    `*Participantes:* até ${p.quantity}`,
    `*Valor:* ${brlCents(p.totalCents)}`,
    "",
    "*DADOS DO CLIENTE*",
    `Nome: ${p.cliente.nome}`,
    `Telefone: ${p.cliente.telefone}`,
    `WhatsApp: ${p.cliente.whatsapp}`,
    `E-mail: ${p.cliente.email}`,
    `Cidade/UF: ${p.cliente.cidade} / ${p.cliente.estado.toUpperCase()}`,
  ];
  if (p.cliente.observacoes) lines.push(`Observações: ${p.cliente.observacoes}`);
  lines.push("", "_Status: aguardando confirmação da equipe._");
  return lines.join("\n");
}


function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-foreground">{value}</p>
    </div>
  );
}
