import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, ScanLine, X } from "lucide-react";
import { toast } from "sonner";
import { decidirSolicitacaoCheckin, listarSolicitacoesCheckin } from "@/lib/fn-checkin";

const dataBr = (d) =>
  d
    ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(d) ? d : `${d}Z`).toLocaleString("pt-BR", {
        timeZone: "America/Fortaleza",
        dateStyle: "short",
        timeStyle: "short",
      })
    : "";

const SELO = {
  pendente: "bg-[#fff6d9] text-[#7a5800]",
  aprovada: "bg-[#e8f6ee] text-[#166b3b]",
  recusada: "bg-[#fdecee] text-[#c81d28]",
};
const ROTULO = { pendente: "Aguardando", aprovada: "Aprovado", recusada: "Recusado" };

// Pedidos de acesso à equipe de check-in (só o administrador vê e decide).
export default function SolicitacoesCheckin({ onAtualizar }) {
  const carregar = useServerFn(listarSolicitacoesCheckin);
  const decidir = useServerFn(decidirSolicitacaoCheckin);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["solicitacoes-checkin"], queryFn: () => carregar() });
  const [ocupado, setOcupado] = useState(null);
  const [verTodos, setVerTodos] = useState(false);

  async function responder(s, aprovar) {
    if (ocupado) return;
    setOcupado(s.id);
    try {
      const res = await decidir({ data: { id: s.id, aprovar } });
      if (!res?.ok) {
        toast.error(res?.erro || "Não foi possível salvar.");
        return;
      }
      toast.success(aprovar ? `${s.nome} agora pode fazer o check-in.` : `Pedido de ${s.nome} recusado.`);
      await refetch();
      onAtualizar?.();
    } catch {
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setOcupado(null);
    }
  }

  if (isLoading) {
    return (
      <p className="jr-card flex items-center gap-3 p-5 text-tinta-suave">
        <Loader2 className="h-5 w-5 animate-spin text-royal" aria-hidden="true" />
        Carregando inscrições de monitores…
      </p>
    );
  }
  if (!data?.ok) return null;

  const pendentes = data.solicitacoes.filter((s) => s.status === "pendente");
  const decididos = data.solicitacoes.filter((s) => s.status !== "pendente");
  const lista = verTodos ? [...pendentes, ...decididos] : pendentes;

  return (
    <section className="jr-card border-t-4 border-amarelo p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-[1.1rem] font-extrabold text-navy">
            <ScanLine className="h-5 w-5 text-royal" aria-hidden="true" />
            Inscrições de monitores
            {pendentes.length > 0 && (
              <span className="rounded-full bg-amarelo px-2 py-0.5 text-[0.8rem] text-navy">{pendentes.length}</span>
            )}
          </h2>
          <p className="jr-legenda mt-1">
            Alunos que se inscreveram na página "Seja monitor". Aprovado, vira Monitor de Frequência: entra na página
            Check-in com o mesmo e-mail e registra as presenças pelo QR Code.
          </p>
        </div>
        {decididos.length > 0 && (
          <button
            type="button"
            onClick={() => setVerTodos((v) => !v)}
            className="text-[0.9rem] font-semibold text-royal hover:underline"
          >
            {verTodos ? "Mostrar só os pendentes" : `Ver também os já respondidos (${decididos.length})`}
          </button>
        )}
      </div>

      {lista.length === 0 ? (
        <p className="mt-4 text-tinta-suave">Nenhuma inscrição de monitor aguardando aprovação.</p>
      ) : (
        <ul className="mt-4 divide-y divide-linea rounded-lg border border-linea">
          {lista.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <strong className="block break-words text-navy">{s.nome}</strong>
                <span className="block break-all text-[0.85rem] text-tinta-suave">{s.email}</span>
                <span className="block text-[0.8rem] text-tinta-suave">
                  {[
                    s.matricula && `Matrícula ${s.matricula}`,
                    s.curso,
                    s.cpf && `CPF ${s.cpf}`,
                    `inscrito em ${dataBr(s.criado_em)}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </div>
              {s.status === "pendente" ? (
                <div className="flex flex-none gap-2">
                  <button
                    type="button"
                    onClick={() => responder(s, true)}
                    disabled={ocupado === s.id}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#1e8e4e] px-4 font-semibold text-white transition hover:bg-[#166b3b] disabled:opacity-60"
                  >
                    {ocupado === s.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                    Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => responder(s, false)}
                    disabled={ocupado === s.id}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-linea px-4 font-semibold text-vermelho-texto transition hover:bg-[#fdecee] disabled:opacity-60"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Recusar
                  </button>
                </div>
              ) : (
                <span className={`flex-none rounded-full px-2.5 py-1 text-[0.8rem] font-semibold ${SELO[s.status]}`}>
                  {ROTULO[s.status]}
                  {s.decidido_em ? ` · ${dataBr(s.decidido_em)}` : ""}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
