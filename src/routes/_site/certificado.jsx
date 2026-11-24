import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, BadgeCheck, CalendarClock, CheckCircle2, ClipboardCheck, Download, Search } from "lucide-react";
import ConsultaCertificado from "@/components/certificado/ConsultaCertificado";
import BannerPagina from "@/components/site/BannerPagina";
import CartaoFaixa from "@/components/painel/CartaoFaixa";
import { CARGA_HORARIA_APRESENTACAO, CARGA_HORARIA_PARTICIPANTE, DATA_LIBERACAO_CERTIFICADOS } from "@/lib/evento";

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

const [ANO, MES, DIA] = DATA_LIBERACAO_CERTIFICADOS.split("-").map(Number);
const LIBERACAO_BR = `${String(DIA).padStart(2, "0")}/${String(MES).padStart(2, "0")}/${ANO}`;

// Dias até a liberação (00:01 de Teresina, UTC-3). Zero ou menos: já liberado.
function diasAteLiberacao() {
  return Math.ceil((Date.UTC(ANO, MES - 1, DIA, 3, 1) - Date.now()) / 86400000);
}

const PASSOS = [
  { Icone: Search, titulo: "Informe seus dados", texto: "Use o CPF e o e-mail cadastrados na inscrição." },
  { Icone: ClipboardCheck, titulo: "Conferimos sua participação", texto: "Presença registrada no evento ou apresentação do trabalho." },
  { Icone: Download, titulo: "Baixe o certificado", texto: "Veja na tela e salve em PDF, com código de autenticidade." },
];

function CertificadoPage() {
  const dias = diasAteLiberacao();
  const liberado = dias <= 0;

  return (
    <>
      <BannerPagina
        sobreposto
        selo={`Certificados · disponíveis a partir de ${LIBERACAO_BR}`}
        titulo="Certificado"
        descricao="Consulte e baixe o seu certificado de participação na VI Jornada Acadêmica."
      />

      <div className="jr-container -mt-20 pb-20">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <CartaoFaixa
            Icone={Award}
            titulo="Consulta de certificado"
            descricao="Informe o CPF e o e-mail usados na inscrição."
            className="shadow-[0_8px_28px_rgba(1,28,99,0.2)]"
            corpoClassName="p-5 sm:p-8"
          >
            <div
              className={`jr-alerta mb-6 ${liberado ? "jr-alerta-sucesso" : "jr-alerta-info"}`}
              role="status"
            >
              {liberado ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
              ) : (
                <CalendarClock className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
              )}
              <span>
                {liberado ? (
                  "Os certificados já estão disponíveis. Faça a sua consulta abaixo."
                ) : (
                  <>
                    Os certificados serão liberados em <strong>{LIBERACAO_BR}</strong>
                    {dias > 0 ? ` (faltam ${dias} ${dias === 1 ? "dia" : "dias"})` : ""}. Até lá, a consulta
                    mostra apenas o aviso de liberação.
                  </>
                )}
              </span>
            </div>
            <ConsultaCertificado />
          </CartaoFaixa>

          <aside className="space-y-5">
            <CartaoFaixa Icone={ClipboardCheck} titulo="Como funciona">
              <ol className="m-0 list-none space-y-4 p-0">
                {PASSOS.map(({ Icone, titulo, texto }, n) => (
                  <li key={titulo} className="flex items-start gap-3">
                    <span className="relative grid h-9 w-9 flex-none place-items-center rounded-full bg-navy text-amarelo">
                      <Icone className="h-4 w-4" aria-hidden="true" />
                      <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-amarelo text-[0.65rem] font-bold text-navy">
                        {n + 1}
                      </span>
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-[0.95rem] font-semibold text-navy">{titulo}</strong>
                      <span className="block text-[0.88rem] leading-snug text-tinta-suave">{texto}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </CartaoFaixa>

            <CartaoFaixa Icone={Award} titulo="Carga horária">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg border border-linea bg-fundo/50 p-3 text-center">
                  <span className="block font-heading text-[1.6rem] font-extrabold leading-none text-navy">
                    {CARGA_HORARIA_APRESENTACAO} h
                  </span>
                  <span className="mt-1 block text-[0.8rem] leading-snug text-tinta-suave">Submeteu e apresentou o trabalho</span>
                </div>
                <div className="rounded-lg border border-linea bg-fundo/50 p-3 text-center">
                  <span className="block font-heading text-[1.6rem] font-extrabold leading-none text-navy">
                    {CARGA_HORARIA_PARTICIPANTE} h
                  </span>
                  <span className="mt-1 block text-[0.8rem] leading-snug text-tinta-suave">Participante, com presença registrada</span>
                </div>
              </div>
            </CartaoFaixa>

            <Link
              to="/validar"
              className="jr-card group flex items-center gap-3 p-4 no-underline transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(1,28,99,0.14)]"
            >
              <span className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-[#e9effc] text-royal">
                <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block font-semibold text-navy">Validar um certificado</strong>
                <span className="block text-[0.85rem] leading-snug text-tinta-suave">Confira a autenticidade pelo código.</span>
              </span>
              <ArrowRight
                className="h-4 w-4 flex-none text-tinta-suave transition group-hover:translate-x-0.5 group-hover:text-royal"
                aria-hidden="true"
              />
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
