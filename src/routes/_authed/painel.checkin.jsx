import { createFileRoute } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";
import PainelCabecalho from "@/components/painel/PainelCabecalho";
import CheckinPainel from "@/components/checkin/CheckinPainel";

export const Route = createFileRoute("/_authed/painel/checkin")({
  head: () => ({ meta: [{ title: "Check-in por QR Code | Painel da Jornada" }] }),
  component: CheckinPage,
});

function CheckinPage() {
  return (
    <>
      <PainelCabecalho
        Icone={ScanLine}
        titulo="Check-in por QR Code"
        descricao="Escolha a atividade e leia o QR Code do ingresso. Nome, dia, horário e status ficam registrados."
      />
      <CheckinPainel />
    </>
  );
}