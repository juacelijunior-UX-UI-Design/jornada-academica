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
            Em <strong>Submissões</strong>, o professor abre cada trabalho (dados, resumo e arquivo), aprova ou
            nega, e marca quem apresentou. Use o filtro por área para ver só os trabalhos de um curso.
          </>
        }
      />
      <InscritosPainel />
    </>
  );
}