import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, ScanLine, UserPlus, Users } from "lucide-react";
import BannerPagina from "@/components/site/BannerPagina";
import CartaoFaixa from "@/components/painel/CartaoFaixa";
import FormularioMonitor from "@/components/equipe/FormularioMonitor";
import { EVENTO } from "@/lib/evento";

export const Route = createFileRoute("/_site/monitores")({
  head: () => ({
    meta: [
      { title: "Seja monitor | VI Jornada Acadêmica da Uninassau Teresina" },
      {
        name: "description",
        content: "Inscrição de alunos da UNINASSAU para a equipe de monitores da VI Jornada Acadêmica.",
      },
    ],
  }),
  component: MonitoresPage,
});

const PASSOS = [
  { Icone: UserPlus, titulo: "Faça a inscrição", texto: "Nome, e-mail, matrícula e curso." },
  { Icone: ClipboardCheck, titulo: "Aguarde a aprovação", texto: "A organização analisa e aprova a equipe." },
  { Icone: ScanLine, titulo: "Trabalhe no evento", texto: `Em ${EVENTO.datas}, entre na página Check-in com o mesmo e-mail e registre as presenças pelo QR Code.` },
];

function MonitoresPage() {
  return (
    <>
      <BannerPagina
        selo="Equipe do evento"
        titulo="Seja monitor"
        descricao="Faça parte da equipe de trabalho da VI Jornada Acadêmica e ajude no credenciamento e no registro de presença."
      />

      <div className="jr-container -mt-8 max-w-[1240px] pb-20">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <FormularioMonitor />
          </div>

          <aside className="order-first min-w-0 space-y-5 lg:order-none">
            <CartaoFaixa Icone={Users} titulo="Como funciona">
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

            <CartaoFaixa Icone={CheckCircle2} titulo="O que o monitor faz">
              <ul className="m-0 list-disc space-y-1.5 pl-5 text-[0.9rem] leading-snug text-tinta">
                <li>Lê o QR Code dos inscritos na entrada das atividades.</li>
                <li>Registra a presença pelo CPF quando a pessoa está sem o QR Code.</li>
                <li>Faz a chamada pela lista de nomes, quando necessário.</li>
              </ul>
              <p className="m-0 mt-3 text-[0.82rem] text-tinta-suave">
                O monitor não vê e-mail, telefone nem trabalhos dos inscritos.
              </p>
            </CartaoFaixa>
          </aside>
        </div>
      </div>
    </>
  );
}
