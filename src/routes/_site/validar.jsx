import { createFileRoute } from "@tanstack/react-router";
import ValidarCodigo from "@/components/certificado/ValidarCodigo";
import BannerPagina from "@/components/site/BannerPagina";

export const Route = createFileRoute("/_site/validar")({
  validateSearch: (search) => ({ codigo: typeof search.codigo === "string" ? search.codigo : undefined }),
  head: () => ({
    meta: [
      { title: "Validar certificado | VI Jornada Acadêmica da Uninassau Teresina" },
      { name: "description", content: "Confira a autenticidade de um certificado da VI Jornada Acadêmica pelo código." },
    ],
  }),
  component: ValidarPage,
});

function ValidarPage() {
  const { codigo } = Route.useSearch();
  return (
    <>
      <BannerPagina
        sobreposto
        selo="Certificados"
        titulo="Validar certificado"
        descricao="Digite o código impresso no certificado para conferir se ele é autêntico."
      />
      <div className="jr-container -mt-20 pb-20">
        <div className="jr-card mx-auto max-w-xl p-6">
          <ValidarCodigo inicial={codigo} />
        </div>
      </div>
    </>
  );
}