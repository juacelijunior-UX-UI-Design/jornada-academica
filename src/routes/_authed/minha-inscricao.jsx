import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Award, CalendarDays, Info, MapPin, SearchX, Ticket } from "lucide-react";
import PainelShell from "@/components/painel/PainelShell";
import PainelCabecalho from "@/components/painel/PainelCabecalho";
import CartaoFaixa from "@/components/painel/CartaoFaixa";
import IngressoCard from "@/components/ingresso/IngressoCard";
import DadosInscricao from "@/components/ingresso/DadosInscricao";
import Botao from "@/components/site/Botao";
import { CARGA_HORARIA_APRESENTACAO, CARGA_HORARIA_PARTICIPANTE, DATA_LIBERACAO_CERTIFICADOS, EVENTO } from "@/lib/evento";
import { meuIngresso } from "@/lib/fn-ingresso";

export const Route = createFileRoute("/_authed/minha-inscricao")({
  loader: () => meuIngresso(),
  head: () => ({ meta: [{ title: "Minha inscrição | VI Jornada Acadêmica" }] }),
  component: MinhaInscricaoPage,
});

const LIBERACAO_BR = DATA_LIBERACAO_CERTIFICADOS.split("-").reverse().join("/");

function Info1({ Icone, rotulo, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-[#e9effc] text-royal">
        <Icone className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 text-[0.92rem] leading-snug">
        <span className="block text-[0.72rem] font-bold uppercase tracking-[0.08em] text-tinta-suave">{rotulo}:</span>
        <span className="text-tinta">{children}</span>
      </span>
    </li>
  );
}

function MinhaInscricaoPage() {
  const dados = Route.useLoaderData();
  const primeiroNome = String(dados.inscricao?.nome || "").trim().split(/\s+/)[0];
  const participante = dados.inscricao?.tipo === "participante";

  return (
    <PainelShell>
      <PainelCabecalho
        Icone={Ticket}
        titulo={dados.encontrado && primeiroNome ? `Olá, ${primeiroNome}!` : "Minha inscrição"}
        descricao="Seus dados de inscrição e o ingresso digital para registrar presença no evento."
      />

      {dados.encontrado ? (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-5">
            <DadosInscricao inscricao={dados.inscricao} />
            <CartaoFaixa Icone={Info} titulo="Informações importantes">
              <ul className="m-0 list-none space-y-3.5 p-0">
                <Info1 Icone={CalendarDays} rotulo="Datas do evento">
                  {EVENTO.datas}
                </Info1>
                <Info1 Icone={MapPin} rotulo="Local">
                  {EVENTO.local}
                </Info1>
                <Info1 Icone={Award} rotulo="Certificado">
                  {participante ? (
                    <>
                      {CARGA_HORARIA_PARTICIPANTE} horas, com presença registrada. Disponível a partir de{" "}
                      <strong className="font-semibold">{LIBERACAO_BR}</strong>.
                    </>
                  ) : (
                    <>
                      {CARGA_HORARIA_APRESENTACAO} horas para quem apresentar o trabalho ({CARGA_HORARIA_PARTICIPANTE} h
                      sem apresentação, com presença). Disponível a partir de{" "}
                      <strong className="font-semibold">{LIBERACAO_BR}</strong>.
                    </>
                  )}
                </Info1>
              </ul>
              <Link
                to="/certificado"
                className="mt-4 inline-flex items-center gap-1 text-[0.9rem] font-semibold text-royal no-underline hover:underline"
              >
                Consultar meu certificado
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CartaoFaixa>
          </div>

          {/* No celular o ingresso vem primeiro; no computador fica fixo na coluna da direita. */}
          <div className="order-first lg:sticky lg:top-24 lg:order-none">
            <IngressoCard ingresso={dados.inscricao} />
          </div>
        </div>
      ) : (
        <CartaoFaixa Icone={SearchX} titulo="Inscrição não encontrada" className="mx-auto max-w-xl">
          <p className="m-0 text-tinta">
            Não encontramos uma inscrição com o e-mail <strong className="break-all">{dados.email}</strong>.
          </p>
          <p className="m-0 mt-2 text-[0.92rem] text-tinta-suave">
            Entre com o mesmo e-mail usado na inscrição ou faça a sua inscrição agora.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Botao to="/inscricao" variante="cta">
              Fazer inscrição
            </Botao>
            <Botao to="/" variante="contorno">
              Voltar ao site
            </Botao>
          </div>
        </CartaoFaixa>
      )}
    </PainelShell>
  );
}
