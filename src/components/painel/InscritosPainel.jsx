import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Pencil, Search } from "lucide-react";
import { idsPorCpf, listarInscritos } from "@/lib/fn-equipe";
import InscritoEditor from "@/components/painel/InscritoEditor";

const norm = (s) =>
  String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function InscritosPainel() {
  const carregar = useServerFn(listarInscritos);
  const buscarCpf = useServerFn(idsPorCpf);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["inscritos-painel"],
    queryFn: () => carregar(),
  });

  const [busca, setBusca] = useState("");
  const [idsCpf, setIdsCpf] = useState(null);
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    const termo = busca.trim();
    if (!/^[\d.\-\s]{3,}$/.test(termo)) {
      setIdsCpf(null);
      return;
    }
    let cancelado = false;
    const t = setTimeout(async () => {
      try {
        const ids = await buscarCpf({ data: { cpf: termo } });
        if (!cancelado) setIdsCpf(new Set(ids));
      } catch {
        if (!cancelado) setIdsCpf(null);
      }
    }, 300);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [busca, buscarCpf]);

  const inscritos = useMemo(() => data?.inscritos ?? [], [data]);

  const visiveis = useMemo(() => {
    const termo = norm(busca.trim());
    const digitos = busca.replace(/\D/g, "");
    if (!termo) return inscritos;
    return inscritos.filter(
      (i) =>
        norm(i.nome).includes(termo) ||
        norm(i.curso).includes(termo) ||
        norm(i.titulo).includes(termo) ||
        (digitos && String(i.matricula || "").includes(digitos)) ||
        (idsCpf?.has(i.id) ?? false)
    );
  }, [inscritos, busca, idsCpf]);

  if (isLoading) {
    return (
      <p className="jr-card flex items-center gap-3 p-6 text-tinta-suave">
        <Loader2 className="h-5 w-5 animate-spin text-royal" aria-hidden="true" />
        Carregando inscritos…
      </p>
    );
  }
  if (isError || !data?.ok) {
    return <div className="jr-alerta jr-alerta-erro" role="alert">{data?.erro || "Não foi possível carregar as inscrições."}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="jr-card p-5">
        <label htmlFor="busca-inscritos" className="jr-label">Buscar aluno ou participante</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-tinta-suave" aria-hidden="true" />
          <input
            id="busca-inscritos"
            type="search"
            className="jr-input pl-10"
            placeholder="Nome, curso, título, matrícula ou CPF"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <p className="jr-legenda mt-3">
          {data.total} inscrito(s) · {visiveis.length} na lista · aprovação por {data.regra}
        </p>
      </div>

      <div className="jr-card overflow-hidden">
        {visiveis.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-[0.95rem]">
              <thead className="bg-fundo text-[0.8rem] uppercase tracking-wide text-tinta-suave">
                <tr>
                  <th className="px-4 py-2.5">Nome</th>
                  <th className="px-4 py-2.5">Curso</th>
                  <th className="px-4 py-2.5">Formato</th>
                  <th className="px-4 py-2.5">Presença</th>
                  <th className="px-4 py-2.5">Situação</th>
                  <th className="px-4 py-2.5"><span className="sr-only">Editar</span></th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((i) => (
                  <tr key={i.id} className="border-t border-linea">
                    <td className="px-4 py-3">
                      <strong className="block text-navy">{i.nome}</strong>
                      <span className="block text-[0.8rem] text-tinta-suave">{i.email}</span>
                    </td>
                    <td className="px-4 py-3">{i.curso || "—"}</td>
                    <td className="px-4 py-3">{i.formato === "banner" ? "Banner" : "Comunicação oral"}</td>
                    <td className="px-4 py-3">{i.presencas} sessão(ões) · {i.percentual}%</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.8rem] font-semibold ${i.elegivel ? "bg-[#e8f6ee] text-[#166b3b]" : "bg-[#eef1f8] text-tinta-suave"}`}>
                        {i.elegivel ? "Apto ao certificado" : "Presença pendente"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditando(i)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-linea px-3 font-semibold text-royal transition hover:bg-fundo"
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-6 text-tinta-suave">Nenhuma inscrição encontrada para esta busca.</p>
        )}
      </div>

      {editando && (
        <InscritoEditor inscrito={editando} onFechar={() => setEditando(null)} onSalvo={refetch} />
      )}
    </div>
  );
}