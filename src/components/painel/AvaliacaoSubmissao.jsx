import { useState } from "react";
import { CheckCircle2, Clock, Loader2, RotateCcw, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const SITUACOES_AVALIACAO = {
  pendente: { texto: "Aguardando avaliação", curto: "Aguardando", Icone: Clock, classe: "bg-[#fff6d9] text-[#7a5800]" },
  aprovado: { texto: "Aprovado", curto: "Aprovado", Icone: CheckCircle2, classe: "bg-[#e8f6ee] text-[#166b3b]" },
  negado: { texto: "Negado", curto: "Negado", Icone: XCircle, classe: "bg-[#fdecee] text-[#c81d28]" },
};

export function SeloAvaliacao({ avaliacao }) {
  const s = SITUACOES_AVALIACAO[avaliacao] || SITUACOES_AVALIACAO.pendente;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.8rem] font-semibold ${s.classe}`}>
      <s.Icone className="h-3.5 w-3.5" aria-hidden="true" />
      {s.texto}
    </span>
  );
}

// Janela para negar, com justificativa opcional.
function DialogoNegar({ inscrito, onConfirmar, onFechar, ocupado }) {
  const [motivo, setMotivo] = useState("");
  return (
    <Dialog open onOpenChange={(v) => !v && !ocupado && onFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="font-heading text-[1.15rem] text-navy">Negar submissão</DialogTitle>
          <DialogDescription className="text-tinta-suave">
            “{inscrito.titulo || "Trabalho sem título"}”, de {inscrito.nome}.
          </DialogDescription>
        </DialogHeader>
        <label htmlFor="motivo-negar" className="jr-label mb-1">
          Motivo (opcional):
        </label>
        <textarea
          id="motivo-negar"
          className="jr-input min-h-[6rem] resize-y"
          maxLength={500}
          placeholder="Ex.: o resumo não segue o modelo do edital."
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
        <p className="jr-legenda -mt-1 text-right">{motivo.length}/500</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onFechar}
            disabled={ocupado}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-linea bg-white px-4 font-semibold text-navy hover:bg-fundo disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirmar(motivo)}
            disabled={ocupado}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#c81d28] px-4 font-semibold text-white hover:bg-[#a3141e] disabled:opacity-60"
          >
            {ocupado ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ThumbsDown className="h-4 w-4" aria-hidden="true" />}
            Confirmar negação
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Botões Aprovar / Negar (ou a decisão já tomada, com opção de desfazer).
export default function AvaliacaoSubmissao({ inscrito: i, ocupado, onAvaliar, empilhado = false }) {
  const [negando, setNegando] = useState(false);
  const decidido = i.avaliacao === "aprovado" || i.avaliacao === "negado";

  const avaliar = async (decisao, motivo = "") => {
    const ok = await onAvaliar(i, decisao, motivo);
    if (ok !== false) setNegando(false);
  };

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {decidido ? (
        <div className={`flex flex-wrap items-center gap-2 ${empilhado ? "justify-center" : ""}`}>
          <SeloAvaliacao avaliacao={i.avaliacao} />
          <button
            type="button"
            onClick={() => avaliar("pendente")}
            disabled={ocupado}
            className="inline-flex items-center gap-1 text-[0.82rem] font-semibold text-royal hover:underline disabled:opacity-60"
            aria-label={`Desfazer avaliação de ${i.nome}`}
          >
            {ocupado ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
            Desfazer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => avaliar("aprovado")}
            disabled={ocupado}
            aria-label={`Aprovar submissão de ${i.nome}`}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1e8e4e] px-3 text-[0.9rem] font-semibold text-white hover:bg-[#166b3b] disabled:opacity-60"
          >
            {ocupado ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ThumbsUp className="h-4 w-4" aria-hidden="true" />}
            Aprovar
          </button>
          <button
            type="button"
            onClick={() => setNegando(true)}
            disabled={ocupado}
            aria-label={`Negar submissão de ${i.nome}`}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#e40822] bg-white px-3 text-[0.9rem] font-semibold text-[#c81d28] hover:bg-[#fdecee] disabled:opacity-60"
          >
            <ThumbsDown className="h-4 w-4" aria-hidden="true" />
            Negar
          </button>
        </div>
      )}
      {i.avaliacao === "negado" && i.avaliacao_motivo && (
        <p className="m-0 break-words rounded-md bg-[#fdecee] px-2.5 py-1.5 text-[0.8rem] text-[#8f1119]">
          <strong>Motivo:</strong> {i.avaliacao_motivo}
        </p>
      )}
      {negando && (
        <DialogoNegar inscrito={i} ocupado={ocupado} onFechar={() => setNegando(false)} onConfirmar={(m) => avaliar("negado", m)} />
      )}
    </div>
  );
}
