import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, FileSearch, KeyRound, ShieldCheck } from "lucide-react";
import ValidarCodigo from "@/components/certificado/ValidarCodigo";
import BannerPagina from "@/components/site/BannerPagina";
import CartaoFaixa from "@/components/painel/CartaoFaixa";

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

const DICAS = [
  {
    Icone: FileSearch,
    titulo: "Onde está o código",
    texto: "No rodapé do certificado, com 12 caracteres no formato XXXX-XXXX-XXXX.",
  },
  {
    Icone: KeyRound,
    titulo: "Digite como aparece",
    texto: "O hífen é colocado sozinho. Letras maiúsculas ou minúsculas tanto faz.",
  },
  {
    Icone: ShieldCheck,
    titulo: "Resultado na hora",
    texto: "Se o código for válido, mostramos o nome, o curso e a carga horária.",
  },
];

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
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <CartaoFaixa
            Icone={ShieldCheck}
            titulo="Verificação de autenticidade"
            descricao="Qualquer pessoa pode conferir um certificado emitido pela Jornada."
            className="shadow-[0_8px_28px_rgba(1,28,99,0.2)]"
            corpoClassName="p-5 sm:p-8"
          >
            <ValidarCodigo inicial={codigo} />
          </CartaoFaixa>

          <aside className="space-y-5">
            <CartaoFaixa Icone={FileSearch} titulo="Como validar">
              <ul className="m-0 list-none space-y-4 p-0">
                {DICAS.map(({ Icone, titulo, texto }) => (
                  <li key={titulo} className="flex items-start gap-3">
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-navy text-amarelo">
                      <Icone className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-[0.95rem] font-semibold text-navy">{titulo}</strong>
                      <span className="block text-[0.88rem] leading-snug text-tinta-suave">{texto}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </CartaoFaixa>

            <Link
              to="/certificado"
              className="jr-card group flex items-center gap-3 p-4 no-underline transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(1,28,99,0.14)]"
            >
              <span className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-[#e9effc] text-royal">
                <Award className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block font-semibold text-navy">Consultar meu certificado</strong>
                <span className="block text-[0.85rem] leading-snug text-tinta-suave">Use o CPF e o e-mail da inscrição.</span>
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
