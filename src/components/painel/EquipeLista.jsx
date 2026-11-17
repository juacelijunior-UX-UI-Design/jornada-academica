import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removerMembro, salvarMembro } from "@/lib/fn-equipe";
import { PERFIS, PERFIS_EQUIPE } from "@/lib/perfis";

export default function EquipeLista({ membros, onAtualizar }) {
  const salvar = useServerFn(salvarMembro);
  const remover = useServerFn(removerMembro);

  async function mudarPerfil(m, perfil) {
    try {
      const res = await salvar({ data: { id: m.id, nome: m.nome, email: m.email, perfil, ativo: m.ativo } });
      if (!res?.ok) return toast.error(res?.erro || "Não foi possível salvar.");
      toast.success("Perfil atualizado.");
      onAtualizar?.();
    } catch {
      toast.error("Não foi possível salvar.");
    }
  }

  async function excluir(m) {
    if (!window.confirm(`Remover o perfil de ${m.nome || m.email}? A conta continua existindo, mas perde o acesso ao painel.`)) return;
    try {
      const res = await remover({ data: { id: m.id } });
      if (!res?.ok) return toast.error(res?.erro || "Não foi possível remover.");
      toast.success("Perfil removido.");
      onAtualizar?.();
    } catch {
      toast.error("Não foi possível remover.");
    }
  }

  if (!membros.length) {
    return <p className="jr-legenda">Nenhum membro na equipe ainda. Convide alguém acima.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-linea">
      <table className="w-full min-w-[34rem] text-left text-[0.95rem]">
        <thead className="bg-fundo text-[0.8rem] uppercase tracking-wide text-tinta-suave">
          <tr>
            <th className="px-3 py-2.5">Nome</th>
            <th className="px-3 py-2.5">E-mail</th>
            <th className="px-3 py-2.5">Perfil</th>
            <th className="px-3 py-2.5"><span className="sr-only">Remover</span></th>
          </tr>
        </thead>
        <tbody>
          {membros.map((m) => (
            <tr key={m.id} className="border-t border-linea">
              <td className="px-3 py-2.5 font-semibold text-navy">{m.nome || "—"}</td>
              <td className="px-3 py-2.5">{m.email}</td>
              <td className="px-3 py-2.5">
                <select
                  className="jr-input min-h-10 py-1"
                  value={m.perfil}
                  aria-label={`Perfil de ${m.nome || m.email}`}
                  onChange={(e) => mudarPerfil(m, e.target.value)}
                >
                  {PERFIS_EQUIPE.map((p) => (
                    <option key={p} value={p}>{PERFIS[p]}</option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2.5 text-right">
                <button
                  type="button"
                  onClick={() => excluir(m)}
                  aria-label={`Remover ${m.nome || m.email}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-linea text-vermelho-texto transition hover:bg-[#fdecee]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}