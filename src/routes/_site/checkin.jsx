import { createFileRoute } from "@tanstack/react-router";
import AcessoCheckin from "@/components/checkin/AcessoCheckin";
import BannerPagina from "@/components/site/BannerPagina";

export const Route = createFileRoute("/_site/checkin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Check-in | VI Jornada Acadêmica da Uninassau Teresina" },
      { name: "description", content: "Área da equipe que registra a presença dos inscritos pelo QR Code." },
    ],
  }),
  component: CheckinPage,
});

function CheckinPage() {
  return (
    <>
      <BannerPagina
        selo="Equipe do evento"
        titulo="Check-in"
        descricao="Registro de presença pelo QR Code dos inscritos. Acesso apenas para a equipe autorizada pelo administrador."
      />
      <div className="jr-container -mt-8 pb-20">
        <div className="mx-auto max-w-[60rem]">
          <AcessoCheckin />
        </div>
      </div>
    </>
  );
}
