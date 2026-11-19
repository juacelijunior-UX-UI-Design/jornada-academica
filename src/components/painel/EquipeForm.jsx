import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { convidarUsuario } from "@/lib/fn-equipe";
import { PERFIS, PERFIS_EQUIPE } from "@/lib/perfis";
import CartaoFaixa from "@/components/painel/CartaoFaixa";

export default function EquipeForm({ onSalvo }) {
  const convidar = useServerFn(convidarUsuario);
  const [form, setForm] = useState({ nome: "", email: "", perfil: "professor" });
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const setCampo = (campo, valor) => {
    setForm((a) => ({ ...a, [campo]: valor }));
    setErro("");
  };

  async function enviar(e) {
    e.preventDefault();
    if (salvando) return;
    setSalvando(true);
    try {
      const res = await convidar({ data: form });
      if (!res?.ok) {
        setErro(res?.erro || "Não foi possível convidar.");
        return;
      }
      toast.success(
        res.convite === "existente" ? "Perfil atualizado para esta conta." : "Convite enviado por e-mail."
      );
      setForm({ nome: "", email: "", perfil: "professor" });
      onSalvo?.();
    } catch {
      setErro("Não foi possível convidar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <CartaoFaixa
      Icone={UserPlus}
      titulo="Convidar para a equipe"
      descricao="A pessoa recebe um convite por e-mail e cria a própria senha no primeiro acesso."
    >

      {erro && <div className="jr-alerta jr-alerta-erro mb-3" role="alert">{erro}</div>}

      <form onSubmit={enviar} noValidate className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto]">
        <div>
          <label htmlFor="membro-nome" className="jr-label">Nome:</label>
          <input id="membro-nome" className="jr-input" value={form.nome} maxLength={120} onChange={(e) => setCampo("nome", e.target.value)} />
        </div>
        <div>
          <label htmlFor="membro-email" className="jr-label">E-mail:</label>
          <input id="membro-email" className="jr-input" type="email" value={form.email} onChange={(e) => setCampo("email", e.target.value)} />
        </div>
        <div>
          <label htmlFor="membro-perfil" className="jr-label">Perfil:</label>
          <select id="membro-perfil" className="jr-input" value={form.perfil} onChange={(e) => setCampo("perfil", e.target.value)}>
            {PERFIS_EQUIPE.map((p) => (
              <option key={p} value={p}>{PERFIS[p]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={salvando}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-royal px-6 font-semibold text-white transition hover:bg-navy disabled:opacity-60"
          >
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Convidar
          </button>
        </div>
      </form>
    </CartaoFaixa>
  );
}