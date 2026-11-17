import { createFileRoute, Outlet } from "@tanstack/react-router";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";

export const Route = createFileRoute("/_site")({
  component: SiteLayoutRoute,
});

function SiteLayoutRoute() {
  return (
    <div className="flex min-h-dvh flex-col bg-fundo">
      <SiteHeader />
      <main id="conteudo" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}