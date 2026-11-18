import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import ModeloCard from "@/components/modelos/ModeloCard";
import { MODELOS } from "@/lib/evento";

export const Route = createFileRoute("/_site/modelos")({
  head: () => ({
    meta: [
      { title: "Modelos de documentos | VI Jornada Acadêmica da Uninassau Teresina" },
      {
        name: "description",
        content: "Baixe os modelos de apresentação oral e de banner da VI Jornada Acadêmica da Uninassau Teresina.",
      },
    ],
  }),
  component: ModelosPage,
});

function ModelosPage() {
  return (
    <>
      <section className="bg-navy pb-32 pt-10">
        <div className="jr-container">
          <p className="text-[0.95rem] font-semibold uppercase tracking-[0.08em] text-amarelo">
            Materiais para a sua apresentação
          </p>
          <h1 className="jr-titulo-bloco filete mt-3 text-white">Modelos de Documentos</h1>
        </div>
      </section>

      <div className="jr-container -mt-20 pb-20">
        <div className="grid gap-6 md:grid-cols-2">
          {MODELOS.map((m) => (
            <ModeloCard key={m.titulo} titulo={m.titulo} descricao={m.descricao} arquivos={m.arquivos} />
          ))}
        </div>
        <p className="mt-8">
          <Link to="/" className="inline-flex items-center gap-2 no-underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voltar para a página inicial
          </Link>
        </p>
      </div>
    </>
  );
}