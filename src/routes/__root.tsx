import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
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
      { name: "author", content: "Rolezin Frontin Off Road" },
      { name: "theme-color", content: "#111111" },
      { property: "og:site_name", content: "Rolezin Frontin Off Road" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "google-site-verification", content: "9Qcudn13O_QvTtORd9SZumz0Pv-8mt-Jofc477RBk1o" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Rubik+Dirt&family=Bebas+Neue&family=Anton&family=Montserrat:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Rolezin Frontin Off Road",
          url: "https://rolezinfrontin.lovable.app",
          logo: "https://rolezinfrontin.lovable.app/favicon.png",
          areaServed: "Engenheiro Paulo de Frontin, RJ",
        }),
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isBare = pathname === "/auth" || pathname === "/admin" || pathname.startsWith("/admin/");
  return (
    <QueryClientProvider client={queryClient}>
      {!isBare && <Navbar />}
      <main className="min-h-dvh">
        <Outlet />
      </main>
      {!isBare && <Footer />}
      {!isBare && <WhatsAppFloat />}
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
