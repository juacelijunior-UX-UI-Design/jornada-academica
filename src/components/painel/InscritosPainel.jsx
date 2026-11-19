import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Eye, FileText, Loader2, Pencil, Presentation, Search, Send, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { idsPorCpf, listarInscritos, marcarApresentacao } from "@/lib/fn-equipe";
import InscritoEditor from "@/components/painel/InscritoEditor";
import TrabalhoDetalhes from "@/components/painel/TrabalhoDetalhes";
import TipoSeletor from "@/components/inscricao/TipoSeletor";

const rotuloFormato = (i) => (i.formato === "banner" ? "Banner" : "Comunicação oral");
const telefoneBr = (t) => {
  const d = String(t || "").replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return t || "—";
};
const textoPresenca = (i) => `${i.presencas} ${i.presencas === 1 ? "sessão" : "sessões"}`;
const norm = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

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

// Botão que marca/desmarca a apresentação do trabalho.
function BotaoApresentou({ i, ocupado, onAlternar }) {
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

function BotaoAcao({ onClick, Icone, children, rotulo, destaque = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      className={`inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-[0.9rem] font-semibold transition ${
        destaque ? "border-navy bg-navy text-white hover:bg-royal" : "border-linea text-royal hover:bg-fundo"
      }`}
    >
      <Icone className="h-4 w-4" aria-hidden="true" />
      {children}
    </button>
  );
}

const th = "whitespace-nowrap px-4 py-2.5";

export default function InscritosPainel() {
  const carregar = useServerFn(listarInscritos);
  const buscarCpf = useServerFn(idsPorCpf);
  const marcar = useServerFn(marcarApresentacao);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["inscritos-painel"],
    queryFn: () => carregar(),
  });

  const [aba, setAba] = useState("submissoes");
  const [busca, setBusca] = useState("");
  const [idsCpf, setIdsCpf] = useState(null);
  const [editando, setEditando] = useState(null);
  const [vendo, setVendo] = useState(null);
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
      toast.success(
        res.apresentou ? `${i.nome}: apresentação registrada (certificado de 20 h).` : `${i.nome}: apresentação desmarcada.`
      );
      await refetch();
    } catch {
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setMarcando(null);
    }
  }

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
  const submissoes = useMemo(() => inscritos.filter((i) => i.tipo !== "participante"), [inscritos]);
  const participantes = useMemo(() => inscritos.filter((i) => i.tipo === "participante"), [inscritos]);

  const visiveis = useMemo(() => {
    const base = aba === "submissoes" ? submissoes : participantes;
    const termo = norm(busca.trim());
    const digitos = busca.replace(/\D/g, "");
    if (!termo) return base;
    return base.filter(
      (i) =>
        norm(i.nome).includes(termo) ||
        norm(i.email).includes(termo) ||
        norm(i.curso).includes(termo) ||
        norm(i.titulo).includes(termo) ||
        (digitos && String(i.matricula || "").includes(digitos)) ||
        (idsCpf?.has(i.id) ?? false)
    );
  }, [aba, submissoes, participantes, busca, idsCpf]);

  if (isLoading) {
    return (
      <p className="jr-card flex items-center gap-3 p-6 text-tinta-suave">
        <Loader2 className="h-5 w-5 animate-spin text-royal" aria-hidden="true" />
        Carregando inscritos…
      </p>
    );
  }
  if (isError || !data?.ok) {
    return (
      <div className="jr-alerta jr-alerta-erro" role="alert">
        {data?.erro || "Não foi possível carregar as inscrições."}
      </div>
    );
  }

  const ehSub = aba === "submissoes";
  const ABAS = [
    { valor: "submissoes", texto: `Submissões (${submissoes.length})`, Icone: Send },
    { valor: "participantes", texto: `Participantes (${participantes.length})`, Icone: UserPlus },
  ];

  return (
    <div className="space-y-5">
      <TipoSeletor destaque rotulo="Tipo de inscrição" opcoes={ABAS} valor={aba} onMudar={setAba} />

      <div className="jr-card p-5">
        <label htmlFor="busca-inscritos" className="jr-label">
          {ehSub ? "Buscar trabalho ou apresentador" : "Buscar participante"}
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-tinta-suave"
            aria-hidden="true"
          />
          <input
            id="busca-inscritos"
            type="search"
            className="jr-input pl-10"
            placeholder={ehSub ? "Nome, título, curso, matrícula ou CPF" : "Nome, e-mail ou CPF"}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <p className="jr-legenda mt-3">
          {visiveis.length} na lista ·{" "}
          {ehSub
            ? "certificado de 20 h para quem apresentou; 4 h para quem só teve presença"
            : "certificado de 4 h com presença registrada"}
        </p>
      </div>

      <div className="jr-card overflow-hidden">
        {!visiveis.length ? (
          <p className="p-6 text-tinta-suave">
            {busca ? "Nada encontrado para esta busca." : ehSub ? "Nenhum trabalho submetido ainda." : "Nenhum participante inscrito ainda."}
          </p>
        ) : ehSub ? (
          <>
            {/* Submissões: cartões no celular e tablet */}
            <ul className="divide-y divide-linea xl:hidden">
              {visiveis.map((i) => (
                <li key={i.id} className="space-y-2 p-4">
                  <p className="m-0 break-words font-heading font-bold text-navy">{i.titulo || "Trabalho sem título"}</p>
                  <p className="m-0 text-[0.9rem]">
                    <strong className="font-semibold">{i.nome}</strong>
                    <span className="block break-all text-[0.8rem] text-tinta-suave">{i.email}</span>
                  </p>
                  <p className="m-0 text-[0.9rem] text-tinta-suave">
                    {[i.curso, i.disciplina, rotuloFormato(i)].filter(Boolean).join(" · ")}
                  </p>
                  <p className="m-0 flex items-center gap-1.5 text-[0.85rem] text-tinta-suave">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    {i.tem_arquivo ? "Arquivo enviado" : "Sem arquivo"} · {textoPresenca(i)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <BotaoAcao destaque onClick={() => setVendo(i)} Icone={Eye} rotulo={`Ver trabalho de ${i.nome}`}>
                      Ver trabalho
                    </BotaoAcao>
                    <BotaoApresentou i={i} ocupado={marcando === i.id} onAlternar={alternarApresentacao} />
                    <SeloSituacao i={i} />
                    <BotaoAcao onClick={() => setEditando(i)} Icone={Pencil} rotulo={`Editar inscrição de ${i.nome}`}>
                      Editar
                    </BotaoAcao>
                  </div>
                </li>
              ))}
            </ul>

            {/* Submissões: tabela no computador (4 colunas, ações empilhadas para nada ser cortado) */}
            <div className="hidden xl:block">
              <table className="w-full table-fixed text-left text-[0.95rem]">
                <colgroup>
                  <col />
                  <col className="w-[22%]" />
                  <col className="w-[11rem]" />
                  <col className="w-[15rem]" />
                </colgroup>
                <thead className="border-b-[3px] border-amarelo bg-navy text-[0.8rem] font-bold uppercase tracking-wide text-white">
                  <tr>
                    <th className="px-4 py-3">Trabalho e apresentador</th>
                    <th className="px-4 py-3">Curso e disciplina</th>
                    <th className="px-4 py-3">Presença e certificado</th>
                    <th className="px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((i) => (
                    <tr key={i.id} className="border-t border-linea align-top">
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setVendo(i)}
                          title={i.titulo}
                          className="w-full text-left font-heading text-[1rem] font-bold leading-snug text-navy [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden hover:text-royal hover:underline"
                        >
                          {i.titulo || "Trabalho sem título"}
                        </button>
                        <span className="mt-1.5 block text-[0.9rem] font-semibold text-tinta">{i.nome}</span>
                        <span className="block break-all text-[0.8rem] text-tinta-suave">{i.email}</span>
                        <span className="mt-1.5 inline-flex items-center gap-1 text-[0.8rem] text-tinta-suave">
                          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                          {i.tem_arquivo ? "Arquivo enviado" : "Sem arquivo"}
                          {i.coautores?.length ? ` · ${i.coautores.length} co-autor(es)` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="block break-words">{i.curso || "—"}</span>
                        <span className="mt-0.5 block text-[0.85rem] text-tinta-suave">{i.disciplina || "—"}</span>
                        <span className="mt-0.5 block text-[0.85rem] text-tinta-suave">{rotuloFormato(i)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="block">{textoPresenca(i)} · {i.percentual}%</span>
                        <span className="mt-2 block">
                          <SeloSituacao i={i} />
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2 [&>button]:w-full [&>button]:justify-center">
                          <BotaoAcao destaque onClick={() => setVendo(i)} Icone={Eye} rotulo={`Ver trabalho de ${i.nome}`}>
                            Ver trabalho
                          </BotaoAcao>
                          <BotaoApresentou i={i} ocupado={marcando === i.id} onAlternar={alternarApresentacao} />
                          <BotaoAcao onClick={() => setEditando(i)} Icone={Pencil} rotulo={`Editar inscrição de ${i.nome}`}>
                            Editar
                          </BotaoAcao>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* Participantes: cartões no celular e tablet */}
            <ul className="divide-y divide-linea xl:hidden">
              {visiveis.map((i) => (
                <li key={i.id} className="space-y-1.5 p-4">
                  <strong className="block break-words text-navy">{i.nome}</strong>
                  <span className="block break-all text-[0.85rem] text-tinta-suave">{i.email}</span>
                  <span className="block text-[0.9rem]">
                    {telefoneBr(i.telefone)} · CPF {i.cpf}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[0.9rem] text-tinta-suave">{textoPresenca(i)}</span>
                    <SeloSituacao i={i} />
                    <BotaoAcao onClick={() => setEditando(i)} Icone={Pencil} rotulo={`Editar inscrição de ${i.nome}`}>
                      Editar
                    </BotaoAcao>
                  </div>
                </li>
              ))}
            </ul>

            {/* Participantes: tabela no computador (4 colunas, nada cortado) */}
            <div className="hidden xl:block">
              <table className="w-full table-fixed text-left text-[0.95rem]">
                <colgroup>
                  <col />
                  <col className="w-[12rem]" />
                  <col className="w-[11rem]" />
                  <col className="w-[8rem]" />
                </colgroup>
                <thead className="border-b-[3px] border-amarelo bg-navy text-[0.8rem] font-bold uppercase tracking-wide text-white">
                  <tr>
                    <th className="px-4 py-3">Participante</th>
                    <th className="px-4 py-3">Telefone e CPF</th>
                    <th className="px-4 py-3">Presença e certificado</th>
                    <th className="px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((i) => (
                    <tr key={i.id} className="border-t border-linea align-top">
                      <td className="px-4 py-4">
                        <strong className="block break-words font-heading text-[1rem] text-navy">{i.nome}</strong>
                        <span className="mt-0.5 block truncate text-[0.85rem] text-tinta-suave" title={i.email}>
                          {i.email}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="block whitespace-nowrap">{telefoneBr(i.telefone)}</span>
                        <span className="mt-0.5 block whitespace-nowrap text-[0.85rem] text-tinta-suave">CPF {i.cpf}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="block">{textoPresenca(i)} · {i.percentual}%</span>
                        <span className="mt-2 block">
                          <SeloSituacao i={i} />
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="[&>button]:w-full [&>button]:justify-center">
                          <BotaoAcao onClick={() => setEditando(i)} Icone={Pencil} rotulo={`Editar inscrição de ${i.nome}`}>
                            Editar
                          </BotaoAcao>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {vendo && <TrabalhoDetalhes inscrito={vendo} onFechar={() => setVendo(null)} />}
      {editando && <InscritoEditor inscrito={editando} onFechar={() => setEditando(null)} onSalvo={refetch} />}
    </div>
  );
}
