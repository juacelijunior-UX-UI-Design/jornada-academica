import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";
import PainelShell from "@/components/painel/PainelShell";
import PainelCabecalho from "@/components/painel/PainelCabecalho";
import ChamadaPainel from "@/components/painel/ChamadaPainel";

export const Route = createFileRoute("/_authed/professor")({
  head: () => ({ meta: [{ title: "Painel de chamada | VI Jornada Acadêmica" }] }),
  component: ProfessorPage,
});

function ProfessorPage() {
  return (
    <PainelShell>
      <PainelCabecalho
        Icone={CalendarCheck}
        titulo="Painel de chamada"
        descricao="Escolha a sessão e marque a presença de quem está na sala. A presença registrada não pode ser desfeita por aqui."
      />
      <ChamadaPainel />
    </PainelShell>
  );
}