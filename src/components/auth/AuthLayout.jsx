import { Link } from "@tanstack/react-router";
import { Image } from "@/components/ui/image";
import { LOGO_JORNADA, LOGO_UNINASSAU } from "@/lib/evento";

// Tela cheia das páginas de acesso (entrar, cadastro, senha), com a identidade da Jornada.
export function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-fundo px-4 py-8 text-foreground">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mx-auto mb-6 flex w-fit items-center gap-3 rounded-lg bg-white px-3 py-1.5 shadow-[0_2px_10px_rgba(1,28,99,0.08)]"
          aria-label="Voltar ao site da VI Jornada Acadêmica"
        >
          <Image src={LOGO_UNINASSAU} alt="UNINASSAU Teresina" fittingType="fit" className="h-7 w-auto" />
          <span aria-hidden="true" className="h-7 w-px bg-linea" />
          <Image src={LOGO_JORNADA} alt="Logo da VI Jornada Acadêmica" fittingType="fit" className="h-7 w-auto" />
        </Link>
        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-navy shadow-[0_4px_12px_rgba(1,28,99,0.2)]">
            <Icon className="h-7 w-7 text-amarelo" aria-hidden="true" />
          </div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-navy">{title}</h1>
          {subtitle && <p className="mt-2 text-tinta-suave">{subtitle}</p>}
        </div>
        <div className="rounded-2xl border border-linea border-t-4 border-t-amarelo bg-card p-8 text-card-foreground shadow-[0_2px_12px_rgba(1,28,99,0.08)] max-sm:p-6">
          {children}
        </div>
        {footer && <p className="mt-6 text-center text-sm text-tinta-suave">{footer}</p>}
      </div>
    </div>
  );
}
