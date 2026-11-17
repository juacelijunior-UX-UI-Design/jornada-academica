import { createFileRoute } from "@tanstack/react-router";
import ChamadaPainel from "@/components/painel/ChamadaPainel";

export const Route = createFileRoute("/_authed/painel/chamada")({
  head: () => ({ meta: [{ title: "Chamada | Painel da Jornada" }] }),
  component: ChamadaPage,
});

function ChamadaPage() {
  return (
    <>
      <h1 className="font-heading text-[clamp(1.3rem,4vw,1.8rem)] font-extrabold text-navy">Chamada por atividade</h1>
      <p className="mb-5 mt-1 text-tinta-suave">
        Escolha a sessão e marque a presença dos alunos presentes. A presença registrada não pode ser desfeita por aqui.
      </p>
      <ChamadaPainel />
    </>
  );
}