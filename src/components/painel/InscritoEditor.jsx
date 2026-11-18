import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { atualizarInscrito } from "@/lib/fn-equipe";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CAMPOS = [
  { id: "nome", label: "Nome completo", max: 150 },
  { id: "email", label: "E-mail", max: 150 },
  { id: "telefone", label: "Telefone", max: 20 },
  { id: "instituicao", label: "Instituição", max: 150, soSubmissao: true },
  { id: "curso", label: "Curso", max: 100, soSubmissao: true },
  { id: "titulo", label: "Título do trabalho", max: 200, soSubmissao: true },
];

export default function InscritoEditor({ inscrito, onFechar, onSalvo }) {
  const salvar = useServerFn(atualizarInscrito);
  // Participante (ouvinte) não tem trabalho: só nome, e-mail e telefone.
  const participante = inscrito.tipo === "participante";
  const campos = CAMPOS.filter((c) => !(participante && c.soSubmissao));
  const [form, setForm] = useState({
    nome: inscrito.nome,
    email: inscrito.email,
    telefone: inscrito.telefone || "",
    instituicao: inscrito.instituicao || "",
    curso: inscrito.curso || "",
    titulo: inscrito.titulo || "",
  });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    if (salvando) return;
    setSalvando(true);
    setErro("");
    try {
      const dados = Object.fromEntries(campos.map((c) => [c.id, form[c.id]]));
      const res = await salvar({ data: { id: inscrito.id, ...dados } });
      if (!res?.ok) {
        setErro(res?.erro || "Não foi possível salvar.");
        return;
      }
      toast.success("Inscrição atualizada.");
      onSalvo?.();
      onFechar?.();
    } catch {
      setErro("Não foi possível salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onFechar?.()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{participante ? "Editar participante" : "Editar inscrição"}</DialogTitle>
        </DialogHeader>

        {erro && <div className="jr-alerta jr-alerta-erro" role="alert">{erro}</div>}

        <form onSubmit={enviar} noValidate className="space-y-3">
          {campos.map((c) => (
            <div key={c.id}>
              <label htmlFor={`edit-${c.id}`} className="jr-label">{c.label}</label>
              <input
                id={`edit-${c.id}`}
                className="jr-input"
                maxLength={c.max}
                value={form[c.id]}
                onChange={(e) => setForm((a) => ({ ...a, [c.id]: e.target.value }))}
              />
            </div>
          ))}
          <DialogFooter>
            <button
              type="submit"
              disabled={salvando}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-royal px-5 font-semibold text-white hover:bg-navy disabled:opacity-60"
            >
              {salvando && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar alterações
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}