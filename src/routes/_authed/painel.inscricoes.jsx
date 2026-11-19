import { createFileRoute } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import PainelCabecalho from "@/components/painel/PainelCabecalho";
import InscritosPainel from "@/components/painel/InscritosPainel";

export const Route = createFileRoute("/_authed/painel/inscricoes")({
  head: () => ({ meta: [{ title: "Inscrições | Painel da Jornada" }] }),
  component: InscricoesPage,
});

function InscricoesPage() {
  return (
    <>
      <PainelCabecalho
        Icone={ClipboardList}
        titulo="Inscrições"
        descricao={
          <>
            Em <strong>Submissões</strong>, a banca abre cada trabalho (dados, resumo e arquivo) e marca quem
            apresentou. Em <strong>Participantes</strong>, ficam as inscrições de quem só vai assistir.
          </>
        }
      />
      <InscritosPainel />
    </>
  );
}