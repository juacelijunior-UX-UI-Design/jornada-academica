import { createFileRoute } from "@tanstack/react-router";
import InscritosPainel from "@/components/painel/InscritosPainel";

export const Route = createFileRoute("/_authed/painel/inscricoes")({
  head: () => ({ meta: [{ title: "Inscrições | Painel da Jornada" }] }),
  component: InscricoesPage,
});

function InscricoesPage() {
  return (
    <>
      <h1 className="font-heading text-[clamp(1.3rem,4vw,1.8rem)] font-extrabold text-navy">Inscrições</h1>
      <p className="mb-5 mt-1 text-tinta-suave">
        Em <strong>Submissões</strong>, a banca abre cada trabalho para ver os dados, o resumo e o arquivo, e marca
        quem apresentou. Em <strong>Participantes</strong>, ficam as inscrições de quem só vai assistir.
      </p>
      <InscritosPainel />
    </>
  );
}