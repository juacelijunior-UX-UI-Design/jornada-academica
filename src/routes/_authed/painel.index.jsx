import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, FileCheck2, ScanLine, Users } from "lucide-react";
import { resumoPainel } from "@/lib/fn-equipe";
import { PERFIS } from "@/lib/perfis";

export const Route = createFileRoute("/_authed/painel/")({
  loader: () => resumoPainel(),
  component: VisaoGeral,
});

const ACESSOS = {
  administrador: "Gerencia usuários, perfis, inscrições, configurações e certificados.",
  suporte: "Edita inscrições, configurações e certificados, sem gerenciar usuários.",
  professor: "Gerencia os alunos inscritos e registra a chamada.",
  monitor: "Faz a leitura dos QR Codes no check-in de frequência.",
};

function VisaoGeral() {
  const { perfil, numeros } = Route.useLoaderData();
  const cartoes = numeros
    ? [
        { rotulo: "Inscritos", valor: numeros.inscritos, Icone: ClipboardList, to: "/painel/inscricoes" },
        { rotulo: "Presenças registradas", valor: numeros.presencas, Icone: ScanLine, to: "/painel/checkin" },
        { rotulo: "Certificados emitidos", valor: numeros.certificados, Icone: FileCheck2, to: "/painel/configuracoes" },
        { rotulo: "Atividades", valor: numeros.sessoes, Icone: Users, to: "/painel/chamada" },
      ]
    : [];

  return (
    <>
      <h1 className="font-heading text-[clamp(1.4rem,4vw,2rem)] font-extrabold text-navy">Painel do evento</h1>
      <p className="mb-6 mt-1 text-tinta-suave">{ACESSOS[perfil] || ""}</p>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cartoes.map(({ rotulo, valor, Icone, to }) => (
          <Link key={rotulo} to={to} className="jr-card p-5 no-underline transition hover:-translate-y-0.5">
            <Icone className="h-5 w-5 text-royal" aria-hidden="true" />
            <span className="mt-3 block font-heading text-[1.8rem] font-extrabold leading-none text-navy">{valor}</span>
            <span className="text-[0.9rem] text-tinta-suave">{rotulo}</span>
          </Link>
        ))}
      </div>

      <div className="jr-card mt-5 p-5">
        <h2 className="mb-1 font-heading text-[1.1rem] font-bold text-navy">Perfil {PERFIS[perfil]}</h2>
        <p className="jr-legenda">Use o menu ao lado para abrir cada área liberada para você.</p>
      </div>
    </>
  );
}