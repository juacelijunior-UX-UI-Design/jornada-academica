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
      <section className="bg-navy bg-[linear-gradient(100deg,#011c63_0%,#0b2a86_50%,#1746b8_100%)] pb-16 pt-10 text-white sm:pt-12">
        <div className="jr-container">
          <h1 className="font-heading text-[clamp(2rem,6vw,2.75rem)] font-extrabold text-white">
            Inscrição
          </h1>
          <p className="mt-1 max-w-2xl text-white/80">
            Inscreva o seu trabalho na VI Jornada Acadêmica · 09 e 10/12/2026, na UNINASSAU Teresina.
          </p>
        </div>
      </section>

      <div className="jr-container -mt-8 pb-20">
        <div className="mx-auto max-w-[60rem]">
          <FormularioInscricao aberta={aberta} motivo={motivo} />
        </div>
      </div>
    </>
  );
}
