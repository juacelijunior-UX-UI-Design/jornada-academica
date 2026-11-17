import { createFileRoute } from "@tanstack/react-router";
import PainelShell from "@/components/painel/PainelShell";
import CheckinPainel from "@/components/checkin/CheckinPainel";

export const Route = createFileRoute("/_authed/checkin")({
  head: () => ({ meta: [{ title: "Check-in por QR Code | VI Jornada Acadêmica" }] }),
  component: CheckinPage,
});

function CheckinPage() {
  return (
    <PainelShell>
      <h1 className="font-heading text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-navy">
        Check-in por QR Code
      </h1>
      <p className="mb-6 mt-1 text-tinta-suave">
        Escolha a atividade e leia o QR Code do participante. O nome, o dia, o horário e o status ficam
        registrados e serão usados na emissão do certificado.
      </p>
      <CheckinPainel />
    </PainelShell>
  );
}