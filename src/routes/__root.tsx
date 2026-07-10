import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 pt-24">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl text-brand">404</h1>
        <h2 className="mt-2 text-xl font-semibold">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A trilha que você procura saiu do mapa. Volte para o acampamento base.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-brand">Voltar para o início</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl">Essa página não carregou</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado. Tente novamente ou volte para o início.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="btn-brand">
            Tentar novamente
          </button>
          <a href="/" className="btn-outline-brand">Ir para o início</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Rolezin Frontin Off Road — Passeios de Quadriciclo e UTV em Eng. Paulo de Frontin, RJ" },
      {
        name: "description",
        content:
          "Passeios de quadriciclo e UTV pelas trilhas mais incríveis de Engenheiro Paulo de Frontin, RJ. Aventura, segurança e paisagens inesquecíveis. Reserve pelo WhatsApp.",
      },
      { name: "author", content: "Rolezin Frontin Off Road" },
      { name: "theme-color", content: "#111111" },
      { property: "og:site_name", content: "Rolezin Frontin Off Road" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Rolezin Frontin Off Road — Aventura Off Road no RJ" },
      { property: "og:description", content: "Passeios de quadriciclo e UTV em Engenheiro Paulo de Frontin, RJ." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Anton&family=Montserrat:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      <main className="min-h-dvh">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloat />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
