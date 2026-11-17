import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { listarUsuarios } from "@/lib/fn-equipe";
import EquipeForm from "@/components/painel/EquipeForm";
import EquipeLista from "@/components/painel/EquipeLista";

export default function UsuariosPainel() {
  const carregar = useServerFn(listarUsuarios);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["usuarios-painel"],
    queryFn: () => carregar(),
  });

  if (isLoading) {
    return (
      <p className="jr-card flex items-center gap-3 p-6 text-tinta-suave">
        <Loader2 className="h-5 w-5 animate-spin text-royal" aria-hidden="true" />
        Carregando usuários…
      </p>
    );
  }
  if (isError || !data?.ok) {
    return <div className="jr-alerta jr-alerta-erro" role="alert">{data?.erro || "Não foi possível carregar os usuários."}</div>;
  }

  return (
    <div className="space-y-5">
      <EquipeForm onSalvo={refetch} />

      <section className="jr-card p-5">
        <h2 className="mb-1 font-heading text-[1.1rem] font-extrabold text-navy">Equipe com acesso ao painel</h2>
        <p className="jr-legenda mb-4">Mude o perfil na lista para alterar o que a pessoa pode fazer.</p>
        <EquipeLista membros={data.membros} onAtualizar={refetch} />
      </section>

      <section className="jr-card p-5">
        <h2 className="mb-1 font-heading text-[1.1rem] font-extrabold text-navy">Contas cadastradas</h2>
        <p className="jr-legenda mb-3">{data.contas.length} conta(s) no site.</p>
        <ul className="divide-y divide-linea text-[0.95rem]">
          {data.contas.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <span>
                <strong className="text-navy">{c.nome || "Sem nome"}</strong>
                <span className="block text-tinta-suave">{c.email}</span>
              </span>
              <span className="flex items-center gap-2 text-[0.85rem]">
                {c.role === "admin" && (
                  <span className="rounded-full bg-[#efe8ff] px-2.5 py-0.5 font-semibold text-[#5b2fbf]">Administrador do app</span>
                )}
                {!data.membros.some((m) => m.email === c.email) && (
                  <span className="rounded-full bg-[#eef1f8] px-2.5 py-0.5 font-semibold text-tinta-suave">Sem perfil de equipe</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}