import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, ScanLine, Search, ShieldCheck, UserRound } from "lucide-react";
import { listarUsuarios } from "@/lib/fn-equipe";
import { listarSolicitacoesCheckin } from "@/lib/fn-checkin";
import { PERFIS } from "@/lib/perfis";
import EquipeForm from "@/components/painel/EquipeForm";
import EquipeLista from "@/components/painel/EquipeLista";
import SolicitacoesCheckin from "@/components/painel/SolicitacoesCheckin";

const ABAS = [
  { id: "pedidos", titulo: "Monitores", Icone: ScanLine },
  { id: "equipe", titulo: "Equipe", Icone: ShieldCheck },
  { id: "contas", titulo: "Contas do site", Icone: UserRound },
];

const semAcento = (t) =>
  String(t || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export default function UsuariosPainel() {
  const carregar = useServerFn(listarUsuarios);
  const carregarPedidos = useServerFn(listarSolicitacoesCheckin);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["usuarios-painel"],
    queryFn: () => carregar(),
  });
  // Mesma chave usada em SolicitacoesCheckin: a contagem da aba acompanha as aprovações.
  const { data: pedidos } = useQuery({ queryKey: ["solicitacoes-checkin"], queryFn: () => carregarPedidos() });
  const pendentes = (pedidos?.solicitacoes || []).filter((s) => s.status === "pendente").length;

  const [aba, setAba] = useState(null);
  const abaAtual = aba ?? (pendentes > 0 ? "pedidos" : "equipe");
  const [busca, setBusca] = useState("");

  const contas = useMemo(() => {
    const termo = semAcento(busca.trim());
    const todas = data?.contas || [];
    return termo ? todas.filter((c) => semAcento(`${c.nome} ${c.email}`).includes(termo)) : todas;
  }, [data, busca]);

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

  const perfilDe = (email) => data.membros.find((m) => m.email === email)?.perfil;
  const contagem = { pedidos: pendentes, equipe: data.membros.length, contas: data.contas.length };

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="Seções de usuários" className="grid grid-cols-3 gap-1.5 rounded-xl border border-linea bg-white p-1.5">
        {ABAS.map(({ id, titulo, Icone }) => {
          const ativa = abaAtual === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={ativa}
              onClick={() => setAba(id)}
              className={`flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-[0.85rem] font-semibold leading-tight transition sm:flex-row sm:gap-2 sm:text-[0.92rem] ${
                ativa ? "bg-navy text-white" : "text-navy hover:bg-fundo"
              }`}
            >
              <Icone className="h-4 w-4 flex-none" aria-hidden="true" />
              <span className="text-center">{titulo}</span>
              <span
                className={`rounded-full px-2 text-[0.75rem] ${
                  id === "pedidos" && pendentes > 0
                    ? "bg-amarelo text-navy"
                    : ativa
                      ? "bg-white/20 text-white"
                      : "bg-fundo text-tinta-suave"
                }`}
              >
                {contagem[id]}
              </span>
            </button>
          );
        })}
      </div>

      {abaAtual === "pedidos" && <SolicitacoesCheckin onAtualizar={refetch} />}

      {abaAtual === "equipe" && (
        <>
          <EquipeForm onSalvo={refetch} />
          <section className="jr-card p-5">
            <h2 className="mb-1 font-heading text-[1.1rem] font-extrabold text-navy">Equipe com acesso ao painel</h2>
            <p className="jr-legenda mb-4">Mude o perfil na lista para alterar o que a pessoa pode fazer.</p>
            <EquipeLista membros={data.membros} onAtualizar={refetch} />
          </section>
        </>
      )}

      {abaAtual === "contas" && (
        <section className="jr-card p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="mb-1 font-heading text-[1.1rem] font-extrabold text-navy">Contas cadastradas</h2>
              <p className="jr-legenda">
                {data.contas.length} conta(s) no site. Para dar acesso ao painel, use a aba Equipe.
              </p>
            </div>
            <label className="relative w-full sm:w-72">
              <span className="sr-only">Buscar conta</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-suave" aria-hidden="true" />
              <input
                type="search"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou e-mail"
                className="jr-input !min-h-11 pl-9"
              />
            </label>
          </div>

          {contas.length === 0 ? (
            <p className="mt-4 text-tinta-suave">Nenhuma conta encontrada.</p>
          ) : (
            <ul className="mt-4 divide-y divide-linea rounded-lg border border-linea text-[0.95rem]">
              {contas.map((c) => {
                const perfil = perfilDe(c.email);
                return (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                    <span className="min-w-0">
                      <strong className="block break-words text-navy">{c.nome || "Sem nome"}</strong>
                      <span className="block break-all text-[0.85rem] text-tinta-suave">{c.email}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2 text-[0.8rem]">
                      {c.role === "admin" && (
                        <span className="rounded-full bg-[#efe8ff] px-2.5 py-0.5 font-semibold text-[#5b2fbf]">Administrador do app</span>
                      )}
                      {perfil ? (
                        <span className="rounded-full bg-[#e9effc] px-2.5 py-0.5 font-semibold text-navy">{PERFIS[perfil]}</span>
                      ) : (
                        <span className="rounded-full bg-[#eef1f8] px-2.5 py-0.5 font-semibold text-tinta-suave">Sem perfil de equipe</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
