import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Send, UserPlus } from "lucide-react";
import FormularioInscricao from "@/components/inscricao/FormularioInscricao";
import FormularioParticipante from "@/components/inscricao/FormularioParticipante";
import EditalInscricao from "@/components/inscricao/EditalInscricao";
import TipoSeletor from "@/components/inscricao/TipoSeletor";
import { situacaoInscricoes } from "@/lib/fn-inscricao";
import BannerPagina from "@/components/site/BannerPagina";

const ABAS = [
  { valor: "submissao", texto: "Submissão", Icone: Send },
  { valor: "participante", texto: "Participante", Icone: UserPlus },
];

export const Route = createFileRoute("/_site/inscricao")({
  validateSearch: (search) => ({ aba: search.aba === "participante" ? "participante" : undefined }),
  loader: () => situacaoInscricoes(),
  head: () => ({
    meta: [
      { title: "Inscrição | VI Jornada Acadêmica da Uninassau Teresina" },
      {
        name: "description",
        content:
          "Submeta um trabalho ou inscreva-se como participante da VI Jornada Acadêmica da Uninassau Teresina.",
      },
    ],
  }),
  component: InscricaoPage,
});

function InscricaoPage() {
  const { aberta, motivo } = Route.useLoaderData();
  const { aba } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const atual = aba === "participante" ? "participante" : "submissao";

  const mudarAba = (v) =>
    navigate({ search: { aba: v === "participante" ? "participante" : undefined }, replace: true, resetScroll: false });

  return (
    <>
      <BannerPagina
        selo="VI Jornada Acadêmica · 09 e 10/12/2026"
        titulo="Inscrição"
        descricao="Submeta um trabalho ou inscreva-se como participante do evento."
      />

      <div className="jr-container -mt-8 pb-20">
        <div className="mx-auto max-w-[60rem] space-y-6">
          <TipoSeletor destaque rotulo="Tipo de inscrição" opcoes={ABAS} valor={atual} onMudar={mudarAba} />

          {atual === "submissao" ? (
            <>
              <EditalInscricao />
              <FormularioInscricao aberta={aberta} motivo={motivo} />
            </>
          ) : (
            <FormularioParticipante />
          )}
        </div>
      </div>
    </>
  );
}
