import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, startOfMonth, endOfMonth, isSameDay, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CalendarDays, Car, DollarSign, ShoppingBag, TrendingUp, User } from "lucide-react";
import { AdminService, brlCents } from "@/lib/services/admin-service";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: reservations, isLoading } = useQuery({
    queryKey: ["admin", "reservations"],
    queryFn: () => AdminService.listReservations(),
  });
  const { data: vehicles } = useQuery({
    queryKey: ["admin", "vehicles"],
    queryFn: () => AdminService.listVehiclesAll(),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const list = reservations ?? [];
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const paidList = list.filter((r) => r.payment_status === "PAID");
  const todays = paidList.filter((r) =>
    isSameDay(parseISO(r.reservation_date), today),
  );
  const monthly = paidList.filter((r) => {
    const d = parseISO(r.reservation_date);
    return d >= monthStart && d <= monthEnd;
  });
  const monthlyRevenue = monthly.reduce(
    (s, r) => s + (r.paid_amount ?? r.total_price),
    0,
  );
  const completed = paidList.filter(
    (r) => !isAfter(parseISO(r.reservation_date), today),
  );
  const next = paidList
    .filter((r) => isAfter(parseISO(r.reservation_date + "T23:59:59"), today))
    .sort((a, b) =>
      (a.reservation_date + a.reservation_time).localeCompare(
        b.reservation_date + b.reservation_time,
      ),
    )[0];

  const availableVehicles = (vehicles ?? []).filter(
    (v) => v.status === "ACTIVE",
  ).length;

  // Chart: reservations per day this month
  const perDay = new Map<string, number>();
  monthly.forEach((r) => {
    perDay.set(r.reservation_date, (perDay.get(r.reservation_date) ?? 0) + 1);
  });
  const chartData = Array.from(perDay.entries())
    .sort()
    .map(([date, count]) => ({
      date: format(parseISO(date), "dd/MM"),
      reservas: count,
    }));

  const cards = [
    { label: "Reservas hoje", value: todays.length, icon: ShoppingBag },
    { label: "Reservas do mês", value: monthly.length, icon: CalendarDays },
    { label: "Receita do mês", value: brlCents(monthlyRevenue), icon: DollarSign },
    { label: "Passeios realizados", value: completed.length, icon: TrendingUp },
    {
      label: "Próximo passeio",
      value: next
        ? format(parseISO(next.reservation_date), "dd/MM", { locale: ptBR }) +
          " " +
          next.reservation_time
        : "—",
      icon: User,
    },
    { label: "Veículos ativos", value: availableVehicles, icon: Car },
  ];

  const recent = list.slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Dashboard</p>
        <h1 className="font-display text-4xl uppercase leading-none mt-2">
          Visão geral
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-2xl border border-border/60 bg-card p-5 flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-full bg-brand/20 text-brand grid place-items-center">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {c.label}
                </p>
                <p className="font-display text-2xl mt-1">{c.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <p className="eyebrow mb-4">Reservas pagas no mês</p>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem reservas neste mês.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar dataKey="reservas" fill="hsl(var(--brand, 24 95% 53%))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <p className="eyebrow mb-4">Últimas reservas</p>
          <div className="space-y-3">
            {recent.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma reserva ainda.</p>
            )}
            {recent.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 text-sm border-b border-border/40 pb-2 last:border-0"
              >
                <div className="min-w-0">
                  <p className="font-medium truncate">{r.customer_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.tour_name} · {format(parseISO(r.reservation_date), "dd/MM")}{" "}
                    {r.reservation_time}
                  </p>
                </div>
                <StatusBadge status={r.payment_status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    PENDING_PAYMENT: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    FAILED: "bg-destructive/20 text-destructive border-destructive/40",
    CANCELLED: "bg-muted text-muted-foreground border-border/60",
    COMPLETED: "bg-brand/20 text-brand border-brand/40",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-widest whitespace-nowrap ${styles[status] ?? styles.CANCELLED}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
