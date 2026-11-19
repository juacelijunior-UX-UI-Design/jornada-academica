import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";
import PainelCabecalho from "@/components/painel/PainelCabecalho";
import ChamadaPainel from "@/components/painel/ChamadaPainel";

export const Route = createFileRoute("/_authed/painel/chamada")({
  head: () => ({ meta: [{ title: "Chamada | Painel da Jornada" }] }),
  component: ChamadaPage,
});

function ChamadaPage() {
  return (
    <>
      <PainelCabecalho
        Icone={CalendarCheck}
        titulo="Chamada por atividade"
        descricao="Escolha a sessão e marque a presença de quem está na sala. A presença registrada não pode ser desfeita por aqui."
      />
      <ChamadaPainel />
    </>
  );
}