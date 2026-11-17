import { createFileRoute } from "@tanstack/react-router";
import PainelShell from "@/components/painel/PainelShell";
import ChamadaPainel from "@/components/painel/ChamadaPainel";

export const Route = createFileRoute("/_authed/professor")({
  head: () => ({ meta: [{ title: "Painel de chamada | VI Jornada Acadêmica" }] }),
  component: ProfessorPage,
});

function ProfessorPage() {
  return (
    <PainelShell>
      <h1 className="font-heading text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-navy">
        Painel de chamada
      </h1>
      <p className="mb-6 mt-1 text-tinta-suave">
        Escolha a sessão e marque a presença dos alunos presentes. A presença registrada não pode
        ser desfeita por aqui.
      </p>
      <ChamadaPainel />
    </PainelShell>
  );
}