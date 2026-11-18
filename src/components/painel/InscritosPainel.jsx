import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Pencil, Presentation, Search } from "lucide-react";
import { toast } from "sonner";
import { idsPorCpf, listarInscritos, marcarApresentacao } from "@/lib/fn-equipe";
import InscritoEditor from "@/components/painel/InscritoEditor";

const rotuloFormato = (i) =>
  i.tipo === "participante"
    ? "Participante (ouvinte)"
    : i.formato === "banner"
      ? "Banner"
      : "Comunicação oral";

// Situação do certificado: apto com 20 h (apresentou) ou 4 h (participante / não apresentou).
function SeloSituacao({ i }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[0.8rem] font-semibold ${
        i.elegivel ? "bg-[#e8f6ee] text-[#166b3b]" : "bg-[#eef1f8] text-tinta-suave"
      }`}
    >
      {i.elegivel ? `Apto · ${i.horas_certificado} h` : "Presença pendente"}
    </span>
  );
}

// Botão que marca/desmarca a apresentação do trabalho (só para submissões).
function BotaoApresentou({ i, ocupado, onAlternar }) {
  if (i.tipo === "participante") return <span className="text-tinta-suave">—</span>;
  return (
    <button
      type="button"
      onClick={() => onAlternar(i)}
      disabled={ocupado}
      aria-pressed={i.apresentou}
      aria-label={`${i.apresentou ? "Desmarcar" : "Marcar"} apresentação de ${i.nome}`}
      className={`inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-[0.9rem] font-semibold transition disabled:opacity-60 ${
        i.apresentou
          ? "border-[#1e8e4e] bg-[#e8f6ee] text-[#166b3b] hover:bg-[#d6efe0]"
          : "border-linea text-navy hover:bg-fundo"
      }`}
    >
      {ocupado ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : i.apresentou ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Presentation className="h-4 w-4" aria-hidden="true" />
      )}
      {i.apresentou ? "Apresentou" : "Marcar apresentação"}
    </button>
  );
}

const norm = (s) =>
  String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function InscritosPainel() {
  const carregar = useServerFn(listarInscritos);
  const buscarCpf = useServerFn(idsPorCpf);
  const marcar = useServerFn(marcarApresentacao);
  const [marcando, setMarcando] = useState(null);

  async function alternarApresentacao(i) {
    if (marcando) return;
    setMarcando(i.id);
    try {
      const res = await marcar({ data: { id: i.id, apresentou: !i.apresentou } });
      if (!res?.ok) {
        toast.error(res?.erro || "Não foi possível salvar.");
        return;
      }
      toast.success(res.apresentou ? `${i.nome}: apresentação registrada (certificado de 20 h).` : `${i.nome}: apresentação desmarcada.`);
      await refetch();
    } catch {
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setMarcando(null);
    }
  }
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
          <>
          {/* Celular e tablet: cartões em vez de tabela larga */}
          <ul className="divide-y divide-linea xl:hidden">
            {visiveis.map((i) => (
              <li key={i.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="block break-words text-navy">{i.nome}</strong>
                    <span className="block break-all text-[0.8rem] text-tinta-suave">{i.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditando(i)}
                    aria-label={`Editar inscrição de ${i.nome}`}
                    className="inline-flex min-h-11 flex-none items-center gap-1.5 rounded-lg border border-linea px-3 font-semibold text-royal transition hover:bg-fundo"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Editar
                  </button>
                </div>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.9rem]">
                  <dt className="text-tinta-suave">Curso</dt>
                  <dd className="min-w-0 break-words">{i.curso || "—"}</dd>
                  <dt className="text-tinta-suave">Formato</dt>
                  <dd>{rotuloFormato(i)}</dd>
                  <dt className="text-tinta-suave">Presença</dt>
                  <dd>{i.presencas} {i.presencas === 1 ? "sessão" : "sessões"} · {i.percentual}%</dd>
                </dl>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <SeloSituacao i={i} />
                  {i.tipo !== "participante" && (
                    <BotaoApresentou i={i} ocupado={marcando === i.id} onAlternar={alternarApresentacao} />
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden xl:block">
            <table className="w-full table-auto text-left text-[0.95rem]">
              <thead className="bg-fundo text-[0.8rem] uppercase tracking-wide text-tinta-suave">
                <tr>
                  <th className="px-4 py-2.5">Nome</th>
                  <th className="px-4 py-2.5">Curso</th>
                  <th className="px-4 py-2.5">Formato</th>
                  <th className="whitespace-nowrap px-4 py-2.5">Presença</th>
                  <th className="whitespace-nowrap px-4 py-2.5">Apresentação</th>
                  <th className="whitespace-nowrap px-4 py-2.5">Certificado</th>
                  <th className="w-px px-4 py-2.5"><span className="sr-only">Editar</span></th>
                </tr>
              </thead>
              <tbody>
                {visiveis.map((i) => (
                  <tr key={i.id} className="border-t border-linea">
                    <td className="px-4 py-3 align-middle">
                      <strong className="block break-words text-navy">{i.nome}</strong>
                      <span className="block break-all text-[0.8rem] text-tinta-suave">{i.email}</span>
                    </td>
                    <td className="px-4 py-3">{i.curso || "—"}</td>
                    <td className="px-4 py-3">{rotuloFormato(i)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="block">{i.presencas} {i.presencas === 1 ? "sessão" : "sessões"}</span>
                      <span className="block text-[0.8rem] text-tinta-suave">{i.percentual}%</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <BotaoApresentou i={i} ocupado={marcando === i.id} onAlternar={alternarApresentacao} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <SeloSituacao i={i} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditando(i)}
                        aria-label={`Editar inscrição de ${i.nome}`}
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
          </>
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