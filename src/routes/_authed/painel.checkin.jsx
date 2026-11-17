import { createFileRoute } from "@tanstack/react-router";
import CheckinPainel from "@/components/checkin/CheckinPainel";

export const Route = createFileRoute("/_authed/painel/checkin")({
  head: () => ({ meta: [{ title: "Check-in por QR Code | Painel da Jornada" }] }),
  component: CheckinPage,
});

function CheckinPage() {
  return (
    <>
      <h1 className="font-heading text-[clamp(1.3rem,4vw,1.8rem)] font-extrabold text-navy">Check-in por QR Code</h1>
      <p className="mb-5 mt-1 text-tinta-suave">
        Escolha a atividade e leia o QR Code do ingresso do participante. Nome, dia, horário e status ficam registrados.
      </p>
      <CheckinPainel />
    </>
  );
}