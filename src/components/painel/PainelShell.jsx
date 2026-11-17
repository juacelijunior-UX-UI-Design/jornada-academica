import { Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useAuth } from "@/lib/AuthContext";
import { LOGO_JORNADA, LOGO_UNINASSAU } from "@/lib/evento";

export default function PainelShell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-dvh bg-fundo">
      <header className="border-b-4 border-amarelo bg-navy">
        <div className="jr-container flex flex-wrap items-center justify-between gap-3 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 sm:gap-3 sm:px-3"
            aria-label="Voltar ao site da VI Jornada Acadêmica"
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

          <div className="flex items-center gap-3 text-white">
            <div className="text-right text-[0.85rem] leading-tight">
              <span className="block font-semibold">{user?.full_name || user?.email}</span>
              <Link to="/" className="text-[0.8rem] text-white/70 no-underline hover:text-amarelo">
                Voltar ao site
              </Link>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border-2 border-white/60 px-3 font-semibold text-white transition hover:bg-white hover:text-navy"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="jr-container py-8">{children}</main>
    </div>
  );
}