import { Link } from "@tanstack/react-router";
import { CalendarCheck, ClipboardList, LayoutDashboard, ScanLine, Settings, Users } from "lucide-react";
import { SECOES_PAINEL, podeAcessar } from "@/lib/perfis";

const ICONES = {
  visao: LayoutDashboard,
  usuarios: Users,
  inscricoes: ClipboardList,
  chamada: CalendarCheck,
  checkin: ScanLine,
  configuracoes: Settings,
};

export default function PainelNav({ perfil }) {
  const itens = SECOES_PAINEL.filter((s) => podeAcessar(perfil, s.id));
  return (
    <nav aria-label="Seções do painel" className="min-w-0">
      <ul className="jr-card flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
        {itens.map((s) => {
          const Icone = ICONES[s.id];
          return (
            <li key={s.id} className="flex-none">
              <Link
                to={s.to}
                activeOptions={{ exact: s.to === "/painel" }}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-[0.95rem] font-semibold leading-snug text-navy no-underline transition-colors hover:bg-fundo lg:whitespace-normal lg:px-2.5 lg:text-[0.9rem]"
                activeProps={{ className: "bg-navy text-white hover:bg-navy" }}
              >
                <Icone className="h-4 w-4 flex-none" aria-hidden="true" />
                {s.titulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}