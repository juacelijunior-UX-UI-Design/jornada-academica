import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { excluirInscrito } from "@/lib/fn-equipe";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Confirmação para excluir uma inscrição. Pede que a pessoa digite EXCLUIR, porque não tem como desfazer.
export default function ExcluirInscrito({ inscrito: i, onFechar, onExcluido }) {
  const excluir = useServerFn(excluirInscrito);
  const [confirmacao, setConfirmacao] = useState("");
  const [apagando, setApagando] = useState(false);
  const [erro, setErro] = useState("");
  const participante = i.tipo === "participante";
  const liberado = confirmacao.trim().toUpperCase() === "EXCLUIR";

  async function confirmar() {
    if (!liberado || apagando) return;
    setApagando(true);
    setErro("");
    try {
      const res = await excluir({ data: { id: i.id } });
      if (!res?.ok) {
        setErro(res?.erro || "Não foi possível excluir.");
        return;
      }
      toast.success(`Inscrição de ${res.nome || i.nome} excluída.`);
      onExcluido?.();
      onFechar?.();
    } catch {
      setErro("Não foi possível excluir. Tente novamente.");
    } finally {
      setApagando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && !apagando && onFechar?.()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 font-heading text-[1.15rem] text-[#a3141e]">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
            {participante ? "Excluir participante" : "Excluir submissão"}
          </DialogTitle>
          <DialogDescription className="text-tinta">
            Você vai excluir a inscrição de <strong className="text-navy">{i.nome}</strong>
            {i.email ? <span className="break-all"> ({i.email})</span> : null}.
          </DialogDescription>
        </DialogHeader>

        {!participante && i.titulo && (
          <p className="m-0 rounded-lg bg-fundo px-3 py-2 text-[0.9rem] text-tinta">
            <strong className="font-semibold">Trabalho:</strong> {i.titulo}
          </p>
        )}

        <div className="jr-alerta jr-alerta-erro text-[0.9rem]">
          <TriangleAlert className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <span>
            <strong>Não tem como desfazer.</strong> Saem junto o QR Code de ingresso, as presenças registradas
            {!participante ? ", a avaliação do trabalho" : ""} e os certificados já emitidos para esta pessoa.
          </span>
        </div>

        {erro && (
          <div className="jr-alerta jr-alerta-erro" role="alert">
            {erro}
          </div>
        )}

        <div>
          <label htmlFor="confirmar-exclusao" className="jr-label">
            Para confirmar, digite <span className="font-mono">EXCLUIR</span>:
          </label>
          <input
            id="confirmar-exclusao"
            className="jr-input font-mono uppercase"
            autoComplete="off"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmar()}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onFechar}
            disabled={apagando}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-linea bg-white px-4 font-semibold text-navy hover:bg-fundo disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={!liberado || apagando}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#c81d28] px-4 font-semibold text-white hover:bg-[#a3141e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {apagando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
            {apagando ? "Excluindo..." : "Excluir definitivamente"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
