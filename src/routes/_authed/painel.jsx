import { createFileRoute, Link, Navigate, Outlet, useLocation } from "@tanstack/react-router";
import { ExternalLink, Lock, LogOut } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import { LOGO_JORNADA, LOGO_UNINASSAU } from "@/lib/evento";
import { meuAcesso } from "@/lib/fn-equipe";
import { PERFIS, ehEquipe, podeAcessar, primeiraSecao, secaoDaRota } from "@/lib/perfis";
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
  const { pathname } = useLocation();
  // Cada perfil só abre as seções dele (o monitor, por exemplo, só Chamada e Check-in).
  const secao = secaoDaRota(pathname);
  const bloqueada = liberado && secao && !podeAcessar(acesso.perfil, secao);
  const inicio = primeiraSecao(acesso.perfil);

  // Ao abrir o painel numa seção que o perfil não tem (como a Visão geral, para o monitor),
  // vai direto para a primeira seção liberada.
  if (bloqueada && secao === "visao" && inicio) return <Navigate to={inicio.to} replace />;

  const nome = acesso.nome || acesso.email || "";
  const iniciais =
    nome
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("") || "?";
  const perfilNome = PERFIS[acesso.perfil] || PERFIS.visitante;

  return (
    <div className="min-h-dvh bg-fundo">
      <header className="sticky top-0 z-30 border-b-4 border-amarelo bg-navy">
        <div className="jr-container flex max-w-[1600px] items-center justify-between gap-3 py-2.5">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 sm:gap-3 sm:px-3"
            aria-label="Voltar ao site da VI Jornada Acadêmica"
          >
            <Image src={LOGO_UNINASSAU} alt="UNINASSAU Teresina" fittingType="fit" className="h-6 w-auto sm:h-7" />
            <span aria-hidden="true" className="h-7 w-px bg-linea" />
            <Image src={LOGO_JORNADA} alt="Logo da VI Jornada Acadêmica" fittingType="fit" className="h-6 w-auto sm:h-7" />
          </Link>

          <div className="flex min-w-0 items-center gap-2 text-white sm:gap-3">
            <Link
              to="/"
              className="hidden min-h-10 items-center gap-1.5 rounded-lg px-3 text-[0.9rem] font-semibold text-white/85 no-underline transition hover:bg-white/10 hover:text-white sm:inline-flex"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Ver o site
            </Link>
            <div className={`hidden min-w-0 text-right text-[0.85rem] leading-tight sm:block ${liberado ? "lg:hidden" : ""}`}>
              <span className="block max-w-[9rem] truncate font-semibold sm:max-w-xs">{nome}</span>
              <span className="text-white/70">{perfilNome}</span>
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

      <main className="jr-container max-w-[1600px] py-5 lg:py-7">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-7">
          {liberado && (
            <aside className="min-w-0 lg:sticky lg:top-[5.25rem]">
              <div className="lg:rounded-2xl lg:bg-navy lg:p-3 lg:shadow-[0_8px_24px_rgba(1,28,99,0.18)]">
                <div className="mb-4 hidden items-center gap-3 rounded-xl bg-white/10 p-3 lg:flex">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 flex-none place-items-center rounded-full bg-amarelo font-heading text-[0.95rem] font-extrabold text-navy"
                  >
                    {iniciais}
                  </span>
                  <div className="min-w-0 leading-tight">
                    <span className="block truncate text-[0.9rem] font-semibold text-white" title={nome}>
                      {nome}
                    </span>
                    <span className="text-[0.8rem] text-amarelo">{perfilNome}</span>
                  </div>
                </div>
                <PainelNav perfil={acesso.perfil} />
                <Link
                  to="/"
                  className="mt-4 hidden items-center gap-2 border-t border-white/15 px-3 pt-3 text-[0.85rem] font-semibold text-white/70 no-underline hover:text-amarelo lg:flex"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Voltar ao site do evento
                </Link>
              </div>
            </aside>
          )}

          <div className="min-w-0">
            {bloqueada ? (
              <div className="jr-card p-6">
                <h1 className="flex items-center gap-2 font-heading text-[1.3rem] font-extrabold text-navy">
                  <Lock className="h-5 w-5 text-royal" aria-hidden="true" />
                  Área não liberada
                </h1>
                <p className="mt-2">
                  Seu perfil ({PERFIS[acesso.perfil]}) não tem acesso a esta parte do painel.
                </p>
                {inicio && (
                  <p className="mt-3">
                    <Link to={inicio.to}>Ir para {inicio.titulo}</Link>
                  </p>
                )}
              </div>
            ) : liberado ? (
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