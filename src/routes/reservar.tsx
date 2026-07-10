import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Calendar as CalIcon, Check, ChevronLeft, ChevronRight, Clock, CreditCard, Loader2, Minus, Plus, UsersRound } from "lucide-react";
import { TOURS, brl, type Tour } from "@/lib/tours";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createCheckout } from "@/lib/checkout.functions";

const searchSchema = z.object({ tour: z.string().optional() });

export const Route = createFileRoute("/reservar")({
  head: () => ({
    meta: [
      { title: "Reservar Passeio — Rolezin Frontin Off Road" },
      { name: "description", content: "Reserve seu passeio de quadriciclo ou UTV em Engenheiro Paulo de Frontin. Escolha data, horário e finalize pelo WhatsApp." },
    ],
    links: [{ rel: "canonical", href: "/reservar" }],
  }),
  validateSearch: searchSchema,
  component: ReservarPage,
});

const HORARIOS = ["09:00", "11:00", "14:00", "16:00"];
const STEPS = ["Passeio", "Data", "Horário", "Pessoas", "Dados", "Revisão"] as const;

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

function ReservarPage() {
  const { tour: initialSlug } = Route.useSearch();
  const [step, setStep] = useState(0);
  const [tour, setTour] = useState<Tour | null>(
    initialSlug ? TOURS.find((t) => t.slug === initialSlug) ?? null : null,
  );
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [cliente, setCliente] = useState<Cliente>({
    nome: "", telefone: "", whatsapp: "", email: "", cidade: "", estado: "", observacoes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Cliente, string>>>({});

  const total = useMemo(() => {
    if (!tour) return 0;
    return tour.price * adults + tour.price * 0.5 * kids;
  }, [tour, adults, kids]);

  const canAdvance = () => {
    if (step === 0) return !!tour;
    if (step === 1) return !!date;
    if (step === 2) return !!time;
    if (step === 3) return adults + kids > 0 && (tour ? adults + kids <= tour.maxPeople : true);
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

  const buildMessage = () => {
    if (!tour || !date || !time) return "";
    return [
      "Olá! Gostaria de realizar uma reserva.",
      "",
      `🏁 Passeio: ${tour.name}`,
      `📅 Data: ${format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`,
      `⏰ Horário: ${time}`,
      `👥 Pessoas: ${adults} adulto(s)${kids ? `, ${kids} criança(s)` : ""}`,
      `💰 Valor total: ${brl(total)}`,
      "",
      `Nome: ${cliente.nome}`,
      `Telefone: ${cliente.telefone}`,
      `WhatsApp: ${cliente.whatsapp}`,
      `E-mail: ${cliente.email}`,
      `Cidade: ${cliente.cidade} / ${cliente.estado.toUpperCase()}`,
      cliente.observacoes ? `Observações: ${cliente.observacoes}` : "",
      "",
      "Aguardo confirmação. Obrigado!",
    ].filter(Boolean).join("\n");
  };

  const submitCheckout = useServerFn(createCheckout);
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    if (!tour || !date || !time) return;
    setSubmitting(true);
    try {
      const res = await submitCheckout({
        data: {
          tour_slug: tour.slug,
          tour_name: tour.name,
          reservation_date: format(date, "yyyy-MM-dd"),
          reservation_time: time,
          adults,
          kids,
          total_price: total,
          customer_name: cliente.nome,
          customer_email: cliente.email,
          customer_phone: cliente.telefone,
          customer_whatsapp: cliente.whatsapp,
          customer_city: cliente.cidade,
          customer_state: cliente.estado,
          notes: cliente.observacoes,
        },
      });
      window.location.href = res.url;
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível iniciar o pagamento. Tente novamente.");
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

        {/* Progress */}
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
          {/* Steps */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && <StepTour selected={tour} onSelect={setTour} />}
                {step === 1 && <StepDate date={date} onChange={setDate} />}
                {step === 2 && <StepTime time={time} onChange={setTime} />}
                {step === 3 && (
                  <StepPeople
                    adults={adults}
                    kids={kids}
                    setAdults={setAdults}
                    setKids={setKids}
                    max={tour?.maxPeople ?? 10}
                  />
                )}
                {step === 4 && <StepClient value={cliente} onChange={setCliente} errors={errors} />}
                {step === 5 && (
                  <StepReview
                    tour={tour!}
                    date={date!}
                    time={time!}
                    adults={adults}
                    kids={kids}
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
                <button onClick={confirm} disabled={submitting} className="btn-brand text-xs disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  {submitting ? "Redirecionando..." : "Pagar agora"}
                </button>
              )}
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-28 p-6 rounded-2xl border border-border/60 bg-card">
            <p className="eyebrow mb-4">Resumo</p>
            <dl className="space-y-3 text-sm">
              <Row k="Passeio" v={tour?.name ?? "—"} />
              <Row k="Data" v={date ? format(date, "dd/MM/yyyy") : "—"} />
              <Row k="Horário" v={time ?? "—"} />
              <Row k="Adultos" v={String(adults)} />
              <Row k="Crianças" v={String(kids)} />
              <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                <dt className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Total</dt>
                <dd className="font-display text-3xl text-brand">{brl(total)}</dd>
              </div>
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
function StepTour({ selected, onSelect }: { selected: Tour | null; onSelect: (t: Tour) => void }) {
  return (
    <div>
      <h2 className="font-display text-3xl uppercase">Escolha o passeio</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TOURS.map((t) => {
          const isActive = selected?.slug === t.slug;
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
                <img src={t.image} alt={t.name} loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <p className="font-display text-xl uppercase leading-none">{t.name}</p>
                    <p className="text-xs text-foreground/80 mt-1">{t.duration} · {t.level}</p>
                  </div>
                  <span className="font-display text-brand text-lg">{brl(t.price)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepDate({ date, onChange }: { date?: Date; onChange: (d?: Date) => void }) {
  return (
    <div>
      <h2 className="font-display text-3xl uppercase flex items-center gap-2">
        <CalIcon className="h-6 w-6 text-brand" /> Escolha a data
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">Selecione um dia disponível no calendário.</p>
      <div className="mt-6 inline-block rounded-2xl border border-border/60 bg-card p-3">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onChange}
          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
          locale={ptBR}
          className={cn("pointer-events-auto")}
        />
      </div>
    </div>
  );
}

function StepTime({ time, onChange }: { time: string | null; onChange: (t: string) => void }) {
  return (
    <div>
      <h2 className="font-display text-3xl uppercase flex items-center gap-2">
        <Clock className="h-6 w-6 text-brand" /> Escolha o horário
      </h2>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {HORARIOS.map((h) => (
          <button
            key={h}
            onClick={() => onChange(h)}
            className={cn(
              "py-6 rounded-2xl border font-display text-2xl transition-all",
              time === h ? "border-brand bg-brand text-brand-foreground" : "border-border/60 hover:border-brand/60",
            )}
          >
            {h}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepPeople({
  adults, kids, setAdults, setKids, max,
}: {
  adults: number; kids: number; setAdults: (n: number) => void; setKids: (n: number) => void; max: number;
}) {
  return (
    <div>
      <h2 className="font-display text-3xl uppercase flex items-center gap-2">
        <UsersRound className="h-6 w-6 text-brand" /> Quantas pessoas?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">Máximo de {max} pessoas por passeio.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Counter label="Adultos" hint="Acima de 12 anos" value={adults} onChange={setAdults} min={1} max={max} />
        <Counter label="Crianças" hint="5–11 anos · 50% off" value={kids} onChange={setKids} min={0} max={max} />
      </div>
    </div>
  );
}

function Counter({
  label, hint, value, onChange, min, max,
}: { label: string; hint: string; value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <div className="p-6 rounded-2xl border border-border/60 bg-card">
      <p className="font-display text-xl uppercase">{label}</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-10 w-10 rounded-full border border-border/60 grid place-items-center hover:border-brand"
          aria-label={`Diminuir ${label}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="font-display text-4xl w-16 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="h-10 w-10 rounded-full border border-border/60 grid place-items-center hover:border-brand"
          aria-label={`Aumentar ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
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
  return (
    <div>
      <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</Label>
      <div className="mt-2">{children}</div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function StepReview({
  tour, date, time, adults, kids, total, cliente,
}: {
  tour: Tour; date: Date; time: string; adults: number; kids: number; total: number; cliente: Cliente;
}) {
  return (
    <div>
      <h2 className="font-display text-3xl uppercase">Revise sua reserva</h2>
      <div className="mt-6 p-6 rounded-2xl border border-brand/50 bg-card">
        <div className="grid gap-6 sm:grid-cols-2">
          <Detail label="Passeio" value={tour.name} />
          <Detail label="Data" value={format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} />
          <Detail label="Horário" value={time} />
          <Detail label="Pessoas" value={`${adults} adulto(s)${kids ? `, ${kids} criança(s)` : ""}`} />
          <Detail label="Nome" value={cliente.nome} />
          <Detail label="Contato" value={`${cliente.whatsapp} · ${cliente.email}`} />
          <Detail label="Cidade" value={`${cliente.cidade} / ${cliente.estado.toUpperCase()}`} />
          {cliente.observacoes && <Detail label="Observações" value={cliente.observacoes} />}
        </div>
        <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Valor total</span>
          <span className="font-display text-4xl text-brand">{brl(total)}</span>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Ao confirmar, você será redirecionado para o WhatsApp com a mensagem já preenchida.
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-foreground">{value}</p>
    </div>
  );
}
