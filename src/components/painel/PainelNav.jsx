import { Link } from "@tanstack/react-router";
import { CalendarCheck, ClipboardList, LayoutDashboard, ScanLine, Settings, Users } from "lucide-react";
import { GRUPOS_PAINEL, SECOES_PAINEL, podeAcessar } from "@/lib/perfis";

export const ICONES_SECAO = {
  visao: LayoutDashboard,
  usuarios: Users,
  inscricoes: ClipboardList,
  chamada: CalendarCheck,
  checkin: ScanLine,
  configuracoes: Settings,
};

// Menu do painel. No computador fica na lateral, em grupos; no celular vira uma faixa de abas.
export default function PainelNav({ perfil }) {
  const itens = SECOES_PAINEL.filter((s) => podeAcessar(perfil, s.id));
  const grupos = Object.keys(GRUPOS_PAINEL)
    .map((g) => ({ id: g, titulo: GRUPOS_PAINEL[g], itens: itens.filter((s) => s.grupo === g) }))
    .filter((g) => g.itens.length > 0);

  const linkClasse =
    "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-[0.92rem] font-semibold leading-snug no-underline transition-colors";

  return (
    <nav aria-label="Seções do painel" className="min-w-0">
      {/* Celular e tablet: abas roláveis */}
      <ul className="flex gap-1.5 overflow-x-auto rounded-xl bg-navy p-1.5 lg:hidden">
        {itens.map((s) => {
          const Icone = ICONES_SECAO[s.id];
          return (
            <li key={s.id} className="flex-none">
              <Link
                to={s.to}
                activeOptions={{ exact: s.to === "/painel" }}
                className={`${linkClasse} text-white/85 hover:bg-white/10 hover:text-white`}
                activeProps={{ className: "bg-amarelo !text-navy hover:bg-amarelo" }}
              >
                <Icone className="h-4 w-4 flex-none" aria-hidden="true" />
                {s.titulo}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Computador: menu lateral em grupos */}
      <div className="hidden space-y-4 lg:block">
        {grupos.map((g) => (
          <div key={g.id}>
            <p className="mb-1.5 px-3 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white/50">{g.titulo}</p>
            <ul className="space-y-0.5">
              {g.itens.map((s) => {
                const Icone = ICONES_SECAO[s.id];
                return (
                  <li key={s.id}>
                    <Link
                      to={s.to}
                      activeOptions={{ exact: s.to === "/painel" }}
                      className={`${linkClasse} whitespace-normal text-white/85 hover:bg-white/10 hover:text-white`}
                      activeProps={{ className: "bg-amarelo !text-navy shadow-sm hover:bg-amarelo" }}
                    >
                      <Icone className="h-[1.1rem] w-[1.1rem] flex-none" aria-hidden="true" />
                      {s.titulo}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
