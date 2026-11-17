import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import { LOGO_JORNADA, LOGO_UNINASSAU } from "@/lib/evento";

const LINKS = [
  { texto: "Início", to: "/" },
  { texto: "Sobre o evento", to: "/", hash: "sobre" },
  { texto: "Programação", to: "/", hash: "programacao" },
  { texto: "Cronograma", to: "/", hash: "cronograma" },
  { texto: "Certificado", to: "/certificado" },
  { texto: "Dúvidas", to: "/", hash: "faq" },
];

export default function SiteHeader() {
  const [aberto, setAberto] = useState(false);
  const { user, isLoadingAuth, logout } = useAuth();
  const logado = !isLoadingAuth && Boolean(user);
  const linkClasse =
    "border-b-[3px] border-transparent px-3 py-2 text-[0.95rem] font-semibold text-white no-underline transition-colors hover:text-amarelo";

  return (
    <header className="border-b-4 border-amarelo bg-navy shadow-[0_2px_10px_rgba(1,28,99,0.08)]">
      <div className="jr-container flex items-center justify-between gap-3 py-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 sm:gap-3 sm:px-3"
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

        <nav aria-label="Principal" className="hidden items-center gap-1 xl:flex">
          {LINKS.map((l) => (
            <Link
              key={l.texto}
              to={l.to}
              hash={l.hash}
              className="border-b-[3px] border-transparent px-3 py-2 text-[0.95rem] font-semibold text-white no-underline transition-colors hover:text-amarelo"
              activeProps={{ className: "border-amarelo" }}
            >
              {l.texto}
            </Link>
          ))}
          {logado ? (
            <>
              <Link to="/professor" className={linkClasse}>
                Chamada
              </Link>
              {user.role === "admin" && (
                <Link to="/gerenciador" className={linkClasse}>
                  Gerenciador
                </Link>
              )}
              <button
                type="button"
                onClick={() => logout()}
                className="ml-3 inline-flex items-center gap-2 border-b-[3px] border-transparent px-3 py-2 text-[0.95rem] font-semibold text-white hover:text-amarelo"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="ml-3 inline-flex items-center gap-2 border-b-[3px] border-transparent px-3 py-2 text-[0.95rem] font-semibold text-white no-underline hover:text-amarelo"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
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
          className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-white/60 text-white xl:hidden"
        >
          {aberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {aberto && (
        <nav id="menu-mobile" aria-label="Principal" className="jr-container pb-4 xl:hidden">
          <ul className="flex flex-col rounded-lg bg-white/5 p-2">
            {[
              ...LINKS,
              ...(logado
                ? [
                    { texto: "Chamada", to: "/professor" },
                    ...(user.role === "admin" ? [{ texto: "Gerenciador", to: "/gerenciador" }] : []),
                  ]
                : [{ texto: "Entrar", to: "/login" }]),
            ].map((l) => (
              <li key={l.texto}>
                <Link
                  to={l.to}
                  hash={l.hash}
                  onClick={() => setAberto(false)}
                  className="block rounded-md px-3 py-3 font-semibold text-white no-underline hover:bg-white/10"
                >
                  {l.texto}
                </Link>
              </li>
            ))}
            {logado && (
              <li>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="block w-full rounded-md px-3 py-3 text-left font-semibold text-white hover:bg-white/10"
                >
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