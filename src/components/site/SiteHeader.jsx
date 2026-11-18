import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  Home,
  Info,
  LayoutDashboard,
  ListChecks,
  LogIn,
  LogOut,
  Menu,
  UserPlus,
  X,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import { useAcesso } from "@/hooks/useAcesso";
import { LOGO_JORNADA, LOGO_UNINASSAU } from "@/lib/evento";

const LINKS = [
  { texto: "Início", to: "/", Icone: Home },
  { texto: "O evento", to: "/", hash: "sobre", Icone: Info },
  { texto: "Programação", to: "/", hash: "programacao", Icone: CalendarDays },
  { texto: "Cronograma", to: "/", hash: "cronograma", Icone: ListChecks },
  { texto: "Certificado", to: "/certificado", Icone: Award },
  { texto: "Validar", to: "/validar", Icone: BadgeCheck },
];

const LINK_INSCRICAO = { texto: "Inscrição", to: "/minha-inscricao", Icone: UserPlus };
const LINK_PAINEL = { texto: "Painel", to: "/painel", Icone: LayoutDashboard };
const LINK_ENTRAR = { texto: "Entrar", to: "/login", Icone: LogIn };

export default function SiteHeader() {
  const [aberto, setAberto] = useState(false);
  const { user, isLoadingAuth, logout } = useAuth();
  const { daEquipe } = useAcesso();
  const logado = !isLoadingAuth && Boolean(user);

  // Logado, o menu tem mais itens: entre 1280 e 1359px os ícones somem para tudo caber numa linha.
  const iconeClasse = `h-4 w-4 flex-none ${logado ? "hidden min-[1360px]:block" : ""}`;
  const linkClasse =
    "inline-flex items-center gap-1.5 whitespace-nowrap border-b-[3px] border-transparent px-2.5 py-2 text-[0.95rem] font-semibold text-white no-underline transition-colors hover:text-amarelo";

  const extras = logado ? [LINK_INSCRICAO, ...(daEquipe ? [LINK_PAINEL] : [])] : [];

  return (
    <header className="sticky top-0 z-40 border-b-4 border-amarelo bg-navy shadow-[0_4px_16px_rgba(1,28,99,0.25)]">
      <div className="jr-container flex max-w-[1400px] items-center justify-between gap-3 py-3">
        <Link
          to="/"
          className="flex flex-none items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 sm:gap-3 sm:px-3"
          aria-label="Página inicial da VI Jornada Acadêmica"
        >
          <Image
            src={LOGO_UNINASSAU}
            alt="UNINASSAU Teresina"
            fittingType="fit"
            className="h-6 w-auto sm:h-7"
          />
          <span aria-hidden="true" className="h-7 w-px bg-linea" />
          <Image
            src={LOGO_JORNADA}
            alt="Logo da VI Jornada Acadêmica"
            fittingType="fit"
            className="h-6 w-auto sm:h-7"
          />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-0.5 xl:flex">
          {[...LINKS, ...extras].map(({ texto, to, hash, Icone }) => (
            <Link
              key={texto}
              to={to}
              hash={hash}
              className={hash ? linkClasse : `${linkClasse} data-[status=active]:text-amarelo`}
              activeOptions={{ exact: to === "/" }}
            >
              <Icone className={iconeClasse} aria-hidden="true" />
              {texto}
            </Link>
          ))}
          {logado ? (
            <button type="button" onClick={() => logout()} className={`ml-2 ${linkClasse}`}>
              <LogOut className={iconeClasse} aria-hidden="true" />
              Sair
            </button>
          ) : (
            <Link to={LINK_ENTRAR.to} className={`ml-2 ${linkClasse}`}>
              <LogIn className={iconeClasse} aria-hidden="true" />
              Entrar
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="menu-mobile"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          className="flex h-11 w-11 flex-none items-center justify-center rounded-lg border-2 border-white/60 text-white xl:hidden"
        >
          {aberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {aberto && (
        <nav id="menu-mobile" aria-label="Principal" className="jr-container max-h-[calc(100dvh-5rem)] overflow-y-auto pb-4 xl:hidden">
          <ul className="flex flex-col rounded-lg bg-white/5 p-2">
            {[...LINKS, ...extras, ...(logado ? [] : [LINK_ENTRAR])].map(({ texto, to, hash, Icone }) => (
              <li key={texto}>
                <Link
                  to={to}
                  hash={hash}
                  onClick={() => setAberto(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-3 font-semibold text-white no-underline hover:bg-white/10"
                >
                  <Icone className="h-5 w-5 flex-none text-amarelo" aria-hidden="true" />
                  {texto}
                </Link>
              </li>
            ))}
            {logado && (
              <li>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left font-semibold text-white hover:bg-white/10"
                >
                  <LogOut className="h-5 w-5 flex-none text-amarelo" aria-hidden="true" />
                  Sair
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
