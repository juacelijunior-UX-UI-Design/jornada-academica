import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Loader2, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { buscarPorCpf, carregarChamada, registrarPresencas } from "@/lib/fn-painel";

const norm = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const fmtData = (d) => String(d ?? "").slice(0, 10).split("-").reverse().join("/");

const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function ChamadaPainel() {
  const carregar = useServerFn(carregarChamada);
  const registrar = useServerFn(registrarPresencas);
  const buscarCpfServer = useServerFn(buscarPorCpf);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({ queryKey: ["chamada"], queryFn: () => carregar() });

  const [sessaoEscolhida, setSessaoEscolhida] = useState("");
  const [busca, setBusca] = useState("");
  const [selecionados, setSelecionados] = useState(() => new Set());
  const [idsCpf, setIdsCpf] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const sessoes = data?.sessoes ?? [];
  const participantes = useMemo(() => data?.participantes ?? [], [data]);

  const padrao = sessoes.find((s) => s.data === hoje()) || sessoes[0];
  const sessaoId = sessaoEscolhida || padrao?.id || "";
  const sessao = sessoes.find((s) => s.id === sessaoId);

  const presentes = useMemo(() => {
    const set = new Set();
    (data?.presencas ?? []).forEach((p) => {
      if (p.sessao_id === sessaoId) set.add(p.participante_id);
    });
    return set;
  }, [data, sessaoId]);

  // Busca por CPF acontece no servidor (o painel recebe o CPF mascarado).
  useEffect(() => {
    const termo = busca.trim();
    if (!/^[\d.\-\s]{3,}$/.test(termo)) {
      setIdsCpf(null);
      return;
    }
    let cancelado = false;
    const t = setTimeout(async () => {
      try {
        const ids = await buscarCpfServer({ data: { cpf: termo } });
        if (!cancelado) setIdsCpf(new Set(ids));
      } catch {
        if (!cancelado) setIdsCpf(null);
      }
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [busca, buscarCpfServer]);

  const visiveis = useMemo(() => {
    const termo = norm(busca.trim());
    const digitos = busca.replace(/\D/g, "");
    if (!termo) return participantes;
    return participantes.filter(
      (p) =>
        norm(p.nome).includes(termo) ||
        (digitos && String(p.matricula ?? "").includes(digitos)) ||
        (idsCpf?.has(p.id) ?? false)
    );
  }, [participantes, busca, idsCpf]);

  const pendentesSelecionados = [...selecionados].filter((id) => !presentes.has(id));

  function alternar(id) {
    setSelecionados((atual) => {
      const novo = new Set(atual);
      novo.has(id) ? novo.delete(id) : novo.add(id);
      return novo;
    });
  }

  function marcarTodos() {
    const pendentes = visiveis.filter((p) => !presentes.has(p.id));
    const todos = pendentes.length > 0 && pendentes.every((p) => selecionados.has(p.id));
    setSelecionados((atual) => {
      const novo = new Set(atual);
      pendentes.forEach((p) => (todos ? novo.delete(p.id) : novo.add(p.id)));
      return novo;
    });
  }

  async function salvar() {
    if (salvando || !sessaoId || !pendentesSelecionados.length) return;
    setSalvando(true);
    try {
      const res = await registrar({ data: { sessao_id: sessaoId, participante_ids: pendentesSelecionados } });
      if (!res?.ok) {
        toast.error(res?.erro || "Não foi possível registrar as presenças.");
        return;
      }
      setSelecionados(new Set());
      await queryClient.invalidateQueries({ queryKey: ["chamada"] });
      toast.success(
        `${res.registradas} registrada(s)` +
          (res.ja_registradas ? `, ${res.ja_registradas} já estavam registradas` : "") +
          "."
      );
    } catch {
      toast.error("Não foi possível registrar as presenças. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  if (isLoading) {
    return (
      <p className="jr-card flex items-center gap-3 p-6 text-tinta-suave">
        <Loader2 className="h-5 w-5 animate-spin text-royal" aria-hidden="true" />
        Carregando participantes…
      </p>
    );
  }

  if (isError) {
    return (
      <div className="jr-alerta jr-alerta-erro" role="alert">
        Não foi possível carregar os dados da chamada. Recarregue a página.
      </div>
    );
  }

  if (!sessoes.length) {
    return (
      <div className="jr-alerta jr-alerta-info" role="status">
        Nenhuma sessão cadastrada. Peça à administração para cadastrar as sessões do evento.
      </div>
    );
  }

  const totalPresentes = participantes.filter((p) => presentes.has(p.id)).length;

  return (
    <div className="space-y-5">
      <div className="jr-card p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="sessao" className="jr-label">
              Sessão
            </label>
            <select
              id="sessao"
              className="jr-input"
              value={sessaoId}
              onChange={(e) => {
                setSessaoEscolhida(e.target.value);
                setBusca("");
                setSelecionados(new Set());
                setIdsCpf(null);
              }}
            >
              {sessoes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.titulo}
                  {s.data ? ` · ${fmtData(s.data)}` : ""}
                  {s.hora_inicio && s.hora_fim ? ` (${s.hora_inicio} às ${s.hora_fim})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="busca" className="jr-label">
              Buscar
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-tinta-suave"
                aria-hidden="true"
              />
              <input
                id="busca"
                type="search"
                className="jr-input pl-10"
                placeholder="Nome, matrícula ou CPF"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.95rem] text-tinta-suave">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-royal" aria-hidden="true" />
            {data?.regra}
          </span>
          <span>
            <strong className="text-navy">{participantes.length}</strong> inscritos
          </span>
          <span>
            <strong className="text-navy">{totalPresentes}</strong> presentes nesta sessão
          </span>
          <span>
            <strong className="text-navy">{data?.total_elegiveis ?? 0}</strong> elegíveis
          </span>
        </div>
      </div>

      <div className="jr-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-linea p-4">
          <p className="mb-0 text-[0.95rem] font-semibold text-navy">
            {pendentesSelecionados.length
              ? `${pendentesSelecionados.length} selecionado(s)`
              : "Nenhum aluno selecionado"}
          </p>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none">
            <button
              type="button"
              onClick={marcarTodos}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border-2 border-royal px-4 font-semibold text-royal transition hover:bg-royal hover:text-white"
            >
              Marcar todos
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando || !pendentesSelecionados.length}
              className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-royal px-4 font-semibold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:bg-[#e3e8f4] disabled:text-[#3f4a6b]"
            >
              {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
              {salvando ? "Registrando…" : "Registrar presença"}
            </button>
          </div>
        </div>

        {visiveis.length ? (
          <>
          {/* Celular: lista em cartões, fácil de marcar com o dedo */}
          <ul className="divide-y divide-linea md:hidden" aria-label={`Participantes da sessão ${sessao?.titulo ?? ""}`}>
            {visiveis.map((p) => {
              const presente = presentes.has(p.id);
              return (
                <li key={p.id}>
                  <label className={`flex items-center gap-3 px-4 py-3 ${presente ? "" : "cursor-pointer active:bg-fundo"}`}>
                    <input
                      type="checkbox"
                      className="h-6 w-6 flex-none accent-[#0040ce]"
                      checked={presente || selecionados.has(p.id)}
                      disabled={presente}
                      onChange={() => alternar(p.id)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block break-words font-medium text-navy">{p.nome}</span>
                      <span className="block text-[0.85rem] text-tinta-suave">
                        {p.matricula || "—"}
                        {p.curso ? ` · ${p.curso}` : ""}
                      </span>
                    </span>
                    <span
                      className={`inline-flex flex-none rounded-full px-2.5 py-1 text-[0.8rem] font-semibold ${
                        presente ? "bg-[#e8f6ee] text-[#166b3b]" : "bg-[#eef1f8] text-tinta-suave"
                      }`}
                    >
                      {presente ? "Presente" : "Pendente"}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="hidden overflow-x-auto rounded-lg md:block">
            <table className="w-full min-w-[38rem] border-collapse text-left">
              <caption className="sr-only">
                Participantes da sessão {sessao?.titulo}
              </caption>
              <thead className="border-b-[3px] border-amarelo bg-navy text-[0.8rem] font-bold uppercase tracking-wide text-white">
                <tr>
                  <th scope="col" className="px-4 py-2.5">
                    <span className="sr-only">Selecionar</span>
                  </th>
                  <th scope="col" className="px-4 py-2.5">Nome</th>
                  <th scope="col" className="px-4 py-2.5">Matrícula</th>
                  <th scope="col" className="px-4 py-2.5">Curso</th>
                  <th scope="col" className="px-4 py-2.5">Presença</th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((p) => {
                  const presente = presentes.has(p.id);
                  return (
                    <tr key={p.id} className="border-t border-linea">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-[#0040ce]"
                          aria-label={`Selecionar ${p.nome}`}
                          checked={presente || selecionados.has(p.id)}
                          disabled={presente}
                          onChange={() => alternar(p.id)}
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-navy">{p.nome}</td>
                      <td className="px-4 py-3 text-tinta">{p.matricula || "—"}</td>
                      <td className="px-4 py-3 text-tinta">{p.curso || "—"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[0.8rem] font-semibold ${
                            presente
                              ? "bg-[#e8f6ee] text-[#166b3b]"
                              : "bg-[#eef1f8] text-tinta-suave"
                          }`}
                        >
                          {presente ? "Presente" : "Pendente"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <p className="p-6 text-tinta-suave">Nenhum participante encontrado para esta busca.</p>
        )}
      </div>
    </div>
  );
}