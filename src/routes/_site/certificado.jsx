import { createFileRoute } from "@tanstack/react-router";
import ConsultaCertificado from "@/components/certificado/ConsultaCertificado";
import BannerPagina from "@/components/site/BannerPagina";

export const Route = createFileRoute("/_site/certificado")({
  head: () => ({
    meta: [
      { title: "Consulta de certificado | VI Jornada Acadêmica da Uninassau Teresina" },
      {
        name: "description",
        content:
          "Consulte e baixe o certificado da VI Jornada Acadêmica da Uninassau Teresina com CPF e e-mail.",
      },
    ],
  }),
  component: CertificadoPage,
});

function CertificadoPage() {
  return (
    <>
      <BannerPagina sobreposto selo="Certificados · disponíveis a partir de 14/12/2026" />

      <div className="jr-container -mt-24 pb-20">
        <div className="jr-card mx-auto max-w-[46rem] border-t-[5px] border-amarelo p-6 shadow-[0_8px_28px_rgba(1,28,99,0.2)] max-sm:p-5 sm:p-9">
          <h1 className="jr-titulo-bloco filete mb-3">Consulta de certificado</h1>
          <p className="jr-legenda mb-6">
            Informe o CPF e o e-mail usados na inscrição para verificar a sua participação na VI
            Jornada Acadêmica.
          </p>
          <ConsultaCertificado />
        </div>
      </div>
    </>
  );
}