import { createFileRoute } from "@tanstack/react-router";
import FormularioInscricao from "@/components/inscricao/FormularioInscricao";
import { situacaoInscricoes } from "@/lib/fn-inscricao";

export const Route = createFileRoute("/_site/inscricao")({
  loader: () => situacaoInscricoes(),
  head: () => ({
    meta: [
      { title: "Inscrever meu trabalho | VI Jornada Acadêmica da Uninassau Teresina" },
      {
        name: "description",
        content:
          "Inscrição de trabalhos na VI Jornada Acadêmica da Uninassau Teresina. Período: 16 a 30/11/2026.",
      },
    ],
  }),
  component: InscricaoPage,
});

function InscricaoPage() {
  const { aberta, motivo } = Route.useLoaderData();

  return (
    <>
      <section className="bg-navy pb-32 pt-10">
        <div className="jr-container">
          <p className="text-[0.95rem] font-semibold uppercase tracking-[0.08em] text-amarelo">
            VI Jornada Acadêmica · 09 e 10/12/2026
          </p>
        </div>
      </section>

      <div className="jr-container -mt-24 pb-20">
        <div className="jr-card mx-auto max-w-[46rem] border-t-[5px] border-amarelo p-6 shadow-[0_8px_28px_rgba(1,28,99,0.2)] max-sm:p-5 sm:p-9">
          <h1 className="jr-titulo-bloco filete mb-3">Inscrever meu trabalho</h1>
          <FormularioInscricao aberta={aberta} motivo={motivo} />
        </div>
      </div>
    </>
  );
}