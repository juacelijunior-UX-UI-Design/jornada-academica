import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import { LOGO_JORNADA, LOGO_UNINASSAU } from "@/lib/evento";
import { meuAcesso } from "@/lib/fn-equipe";
import { PERFIS, ehEquipe } from "@/lib/perfis";
import PainelNav from "@/components/painel/PainelNav";

export const Route = createFileRoute("/_authed/painel")({
  loader: () => meuAcesso(),
  head: () => ({ meta: [{ title: "Painel | VI Jornada Acadêmica" }] }),
  component: PainelLayout,
});

function PainelLayout() {
  const acesso = Route.useLoaderData();
  const { logout } = useAuth();
  const liberado = ehEquipe(acesso.perfil);

  return (
    <div className="min-h-dvh bg-fundo">
      <header className="border-b-4 border-amarelo bg-navy">
        <div className="jr-container flex max-w-[1600px] flex-wrap items-center justify-between gap-3 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 sm:gap-3 sm:px-3"
            aria-label="Voltar ao site da VI Jornada Acadêmica"
          >
            <Image src={LOGO_UNINASSAU} alt="UNINASSAU Teresina" fittingType="fit" className="h-6 w-auto sm:h-7" />
            <span aria-hidden="true" className="h-7 w-px bg-linea" />
            <Image src={LOGO_JORNADA} alt="Logo da VI Jornada Acadêmica" fittingType="fit" className="h-6 w-auto sm:h-7" />
          </Link>

          <div className="flex min-w-0 items-center gap-3 text-white">
            <div className="min-w-0 text-right text-[0.85rem] leading-tight">
              <span className="block max-w-[11rem] truncate font-semibold sm:max-w-xs">{acesso.nome || acesso.email}</span>
              <span className="text-white/70">{PERFIS[acesso.perfil] || PERFIS.visitante}</span>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex min-h-10 flex-none items-center gap-2 rounded-lg border-2 border-white/60 px-3 font-semibold text-white transition hover:bg-white hover:text-navy"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="jr-container max-w-[1600px] py-6">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[13rem_minmax(0,1fr)]">
          {liberado && (
            <div className="min-w-0 space-y-3">
              <PainelNav perfil={acesso.perfil} />
              <p className="jr-legenda px-1">
                <Link to="/">Voltar ao site do evento</Link>
              </p>
            </div>
          )}

          <div className="min-w-0">
            {liberado ? (
              <Outlet />
            ) : (
              <div className="jr-card p-6">
                <h1 className="font-heading text-[1.3rem] font-extrabold text-navy">Painel administrativo</h1>
                <p className="mt-2">
                  Sua conta ({acesso.email}) ainda não tem um perfil de equipe. Peça à administração da
                  Jornada para liberar o acesso como professor, monitor, suporte ou administrador.
                </p>
                <p className="mt-3">
                  <Link to="/minha-inscricao">Ver minha inscrição e meu ingresso</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}