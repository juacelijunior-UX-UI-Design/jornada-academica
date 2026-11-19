import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Award, CheckCircle2, ClipboardList, Clock, FileCheck2, Loader2, Lock, Presentation, UserRound } from "lucide-react";
import { carregarAdmin } from "@/lib/fn-admin";
import { CARGA_HORARIA_APRESENTACAO, CARGA_HORARIA_PARTICIPANTE } from "@/lib/evento";
import ConfigFormulario from "@/components/gerenciador/ConfigFormulario";
import EmissaoCard from "@/components/gerenciador/EmissaoCard";

export const Route = createFileRoute("/_authed/painel/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações e certificados | Painel da Jornada" }] }),
  component: ConfiguracoesPage,
});

function Numero({ Icone, valor, rotulo, destaque = false }) {
  return (
    <div className={`jr-card min-w-0 p-4 ${destaque ? "border-t-4 border-amarelo" : ""}`}>
      <Icone className="h-5 w-5 text-royal" aria-hidden="true" />
      <span className="mt-2 block font-heading text-[1.7rem] font-extrabold leading-none text-navy">{valor}</span>
      <span className="mt-1 block text-[0.85rem] leading-snug text-tinta-suave">{rotulo}</span>
    </div>
  );
}

// Regra fixa do sistema (não muda pelo painel): 20 h para quem apresentou, 4 h para os demais.
function CargaHoraria() {
  return (
    <section className="jr-card p-5 sm:p-6" aria-labelledby="titulo-carga">
      <h2 id="titulo-carga" className="font-heading text-[1.2rem] font-extrabold text-navy">
        Carga horária do certificado
      </h2>
      <p className="jr-legenda mt-0.5">Definida automaticamente pelo sistema.</p>
      <ul className="mt-4 space-y-3">
        <li className="flex items-start gap-3 rounded-lg border border-linea p-3">
          <Presentation className="mt-0.5 h-5 w-5 flex-none text-royal" aria-hidden="true" />
          <span>
            <strong className="block font-heading text-[1.1rem] text-navy">{CARGA_HORARIA_APRESENTACAO} horas</strong>
            <span className="text-[0.9rem] text-tinta-suave">
              Submeteu o trabalho e a banca marcou "Apresentou" (em Inscrições).
            </span>
          </span>
        </li>
        <li className="flex items-start gap-3 rounded-lg border border-linea p-3">
          <UserRound className="mt-0.5 h-5 w-5 flex-none text-royal" aria-hidden="true" />
          <span>
            <strong className="block font-heading text-[1.1rem] text-navy">{CARGA_HORARIA_PARTICIPANTE} horas</strong>
            <span className="text-[0.9rem] text-tinta-suave">
              Inscrito como participante, ou submeteu e não apresentou, com presença registrada.
            </span>
          </span>
        </li>
      </ul>
    </section>
  );
}

function ConfiguracoesPage() {
  const carregar = useServerFn(carregarAdmin);
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({ queryKey: ["admin"], queryFn: () => carregar() });
  const recarregar = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  return (
    <>
      <h1 className="font-heading text-[clamp(1.3rem,4vw,1.8rem)] font-extrabold text-navy">Configurações e certificados</h1>
      <p className="mb-5 mt-1 text-tinta-suave">
        Regra de aprovação, datas, assinaturas e emissão dos certificados.
      </p>

      {isLoading && (
        <p className="jr-card flex items-center gap-3 p-6 text-tinta-suave">
          <Loader2 className="h-5 w-5 animate-spin text-royal" aria-hidden="true" />
          Carregando dados do evento…
        </p>
      )}

      {isError && (
        <div className="jr-alerta jr-alerta-erro" role="alert">
          Não foi possível carregar os dados. Recarregue a página.
        </div>
      )}

      {data && !data.ok && (
        <div className="jr-alerta jr-alerta-erro" role="alert">{data.erro}</div>
      )}

      {data?.ok && (
        <div className="space-y-5">
          {/* Situação atual */}
          <div className="flex flex-wrap items-center gap-2">
            {data.liberado ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f6ee] px-3 py-1 text-[0.85rem] font-semibold text-[#166b3b]">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Certificados liberados
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9effc] px-3 py-1 text-[0.85rem] font-semibold text-navy">
                <Lock className="h-4 w-4" aria-hidden="true" />
                Certificados liberados a partir de {data.liberacao}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[0.85rem] font-semibold text-tinta-suave shadow-sm">
              <Clock className="h-4 w-4" aria-hidden="true" />
              Regra: {data.regra}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Numero Icone={ClipboardList} valor={data.total_inscritos} rotulo="Inscritos" />
            <Numero Icone={Award} valor={data.aptos_20h ?? 0} rotulo={`Aptos · ${CARGA_HORARIA_APRESENTACAO} h`} destaque />
            <Numero Icone={Award} valor={data.aptos_4h ?? 0} rotulo={`Aptos · ${CARGA_HORARIA_PARTICIPANTE} h`} destaque />
            <Numero Icone={FileCheck2} valor={data.total_certificados} rotulo="Certificados emitidos" />
          </div>

          {/* Configurações à esquerda; carga horária e emissão à direita */}
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <ConfigFormulario config={data.configuracao} cargaTotal={data.carga_horaria_total} onSalvo={recarregar} />
            <div className="space-y-5">
              <CargaHoraria />
              <EmissaoCard admin={data} onAtualizar={recarregar} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
