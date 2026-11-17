import { createFileRoute, Outlet } from "@tanstack/react-router";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export const Route = createFileRoute("/_site")({
  component: SiteLayoutRoute,
});

function SiteLayoutRoute() {
  return (
    <div className="flex min-h-dvh flex-col bg-fundo">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}