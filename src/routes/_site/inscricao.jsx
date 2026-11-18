import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Send, UserPlus } from "lucide-react";
import FormularioInscricao from "@/components/inscricao/FormularioInscricao";
import FormularioParticipante from "@/components/inscricao/FormularioParticipante";
import EditalInscricao from "@/components/inscricao/EditalInscricao";
import TipoSeletor from "@/components/inscricao/TipoSeletor";
import { situacaoInscricoes } from "@/lib/fn-inscricao";

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
      <section className="bg-navy bg-[linear-gradient(100deg,#011c63_0%,#0b2a86_50%,#1746b8_100%)] pb-16 pt-10 text-white sm:pt-12">
        <div className="jr-container">
          <h1 className="font-heading text-[clamp(2rem,6vw,2.75rem)] font-extrabold text-white">Inscrição</h1>
          <p className="mt-1 max-w-2xl text-white/80">
            Submeta um trabalho ou inscreva-se como participante da VI Jornada Acadêmica · 09 e 10/12/2026.
          </p>
        </div>
      </section>

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
