import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/lib/auth/use-admin";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso Administrativo — Rolezin Frontin Off Road" },
      { name: "robots", content: "noindex" },
    ],
  }),
  ssr: false,
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAdminAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate({ to: "/admin", replace: true });
    }
  }, [loading, session, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bem-vindo!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        toast.success("Conta criada. Se o e-mail estiver autorizado, você entrará como admin.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha na autenticação";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center px-4 pt-24 pb-16 bg-background">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-brand text-brand-foreground grid place-items-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">Área restrita</p>
            <h1 className="font-display text-2xl uppercase leading-none">Admin</h1>
          </div>
        </div>

        {session && !isAdmin && !loading && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            Sua conta está autenticada mas não tem permissão de administrador.
            <button
              className="ml-2 underline"
              onClick={async () => {
                await supabase.auth.signOut();
              }}
            >
              Sair
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={busy} className="btn-brand w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
          className="mt-4 w-full text-xs text-muted-foreground hover:text-brand transition-colors"
        >
          {mode === "login" ? "Primeiro acesso? Criar conta" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
