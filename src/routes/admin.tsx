import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  Car,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/lib/auth/use-admin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo — Rolezin Frontin Off Road" },
      { name: "robots", content: "noindex" },
    ],
  }),
  ssr: false,
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { to: "/admin/reservas", label: "Reservas", icon: ShoppingBag },
  { to: "/admin/veiculos", label: "Veículos", icon: Car },
  { to: "/admin/agenda", label: "Agenda", icon: Calendar },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
] as const;

function AdminLayout() {
  const { loading, session, isAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (loading) return;
    if (!session || !isAdmin) {
      navigate({ to: "/auth", replace: true });
    }
  }, [loading, session, isAdmin, navigate]);

  if (loading || !session || !isAdmin) {
    return (
      <div className="min-h-dvh grid place-items-center bg-background">
        <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
          Carregando…
        </p>
      </div>
    );
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-dvh flex w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border/60 flex flex-col transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b border-border/60 flex items-center gap-2">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-brand text-brand-foreground font-display text-lg leading-none">
            RF
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-sm tracking-widest">ROLEZIN FRONTIN</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-brand">
              Admin
            </span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand text-brand-foreground"
                    : "text-foreground/80 hover:bg-muted hover:text-brand",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border/60 space-y-2">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">
            {session.user.email}
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-14 bg-background/85 backdrop-blur-xl border-b border-border/60 flex items-center gap-3 px-4 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="p-2 -ml-2 rounded-md text-foreground"
            aria-label="Abrir menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-display text-sm tracking-widest">ADMIN</span>
        </header>

        <main className="flex-1 p-4 md:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
