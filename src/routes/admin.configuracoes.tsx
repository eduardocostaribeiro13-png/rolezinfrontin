import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { AdminService, type SiteSettings } from "@/lib/services/admin-service";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/configuracoes")({
  component: AdminSettings,
});

const EMPTY: SiteSettings = {
  id: 1,
  company_name: "",
  phone: "",
  whatsapp: "",
  email: "",
  instagram: "",
  facebook: "",
  address: "",
  business_hours: "",
  cancellation_policy: "",
  email_message: "",
  voucher_message: "",
  logo_url: "",
};

function AdminSettings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => AdminService.getSettings(),
  });
  const [form, setForm] = useState<SiteSettings>(EMPTY);

  useEffect(() => {
    if (data) setForm({ ...EMPTY, ...data });
  }, [data]);

  const saveMut = useMutation({
    mutationFn: () =>
      AdminService.updateSettings({
        company_name: form.company_name,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        instagram: form.instagram,
        facebook: form.facebook,
        address: form.address,
        business_hours: form.business_hours,
        cancellation_policy: form.cancellation_policy,
        email_message: form.email_message,
        voucher_message: form.voucher_message,
        logo_url: form.logo_url,
      }),
    onSuccess: () => {
      toast.success("Configurações salvas");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Falha"),
  });

  if (isLoading) return <Skeleton className="h-96 rounded-2xl" />;

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <p className="eyebrow">Sistema</p>
        <h1 className="font-display text-4xl uppercase leading-none mt-2">
          Configurações
        </h1>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMut.mutate();
        }}
        className="space-y-8"
      >
        <Section title="Empresa">
          <Two>
            <Field label="Nome da empresa">
              <Input value={form.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} />
            </Field>
            <Field label="URL do logo">
              <Input value={form.logo_url ?? ""} onChange={(e) => set("logo_url", e.target.value)} />
            </Field>
          </Two>
          <Field label="Endereço">
            <Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="Horário de funcionamento">
            <Input value={form.business_hours ?? ""} onChange={(e) => set("business_hours", e.target.value)} />
          </Field>
        </Section>

        <Section title="Contato">
          <Two>
            <Field label="Telefone">
              <Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
            </Field>
            <Field label="WhatsApp">
              <Input value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} />
            </Field>
          </Two>
          <Two>
            <Field label="E-mail">
              <Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Instagram">
              <Input value={form.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} />
            </Field>
          </Two>
          <Field label="Facebook">
            <Input value={form.facebook ?? ""} onChange={(e) => set("facebook", e.target.value)} />
          </Field>
        </Section>

        <Section title="Mensagens">
          <Field label="Política de cancelamento">
            <Textarea
              rows={4}
              value={form.cancellation_policy ?? ""}
              onChange={(e) => set("cancellation_policy", e.target.value)}
            />
          </Field>
          <Field label="Mensagem no e-mail de confirmação">
            <Textarea
              rows={4}
              value={form.email_message ?? ""}
              onChange={(e) => set("email_message", e.target.value)}
            />
          </Field>
          <Field label="Mensagem no voucher">
            <Textarea
              rows={4}
              value={form.voucher_message ?? ""}
              onChange={(e) => set("voucher_message", e.target.value)}
            />
          </Field>
        </Section>

        <div className="flex justify-end">
          <button type="submit" className="btn-brand text-xs" disabled={saveMut.isPending}>
            <Save className="h-4 w-4" /> Salvar alterações
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
      <h2 className="font-display text-xl uppercase">{title}</h2>
      {children}
    </div>
  );
}

function Two({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
