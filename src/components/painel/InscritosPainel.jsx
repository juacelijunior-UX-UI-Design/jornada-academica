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

            {/* Submissões: tabela no computador */}
            <div className="hidden xl:block">
              <table className="w-full table-auto text-left text-[0.95rem]">
                <thead className="bg-fundo text-[0.8rem] uppercase tracking-wide text-tinta-suave">
                  <tr>
                    <th className="px-4 py-2.5">Trabalho e apresentador</th>
                    <th className="px-4 py-2.5">Curso e disciplina</th>
                    <th className={th}>Presença</th>
                    <th className={th}>Apresentação</th>
                    <th className={th}>Certificado</th>
                    <th className="w-px px-4 py-2.5">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((i) => (
                    <tr key={i.id} className="border-t border-linea align-middle">
                      <td className="px-4 py-3">
                        <strong className="block break-words font-heading text-navy">{i.titulo || "Trabalho sem título"}</strong>
                        <span className="block text-[0.9rem]">{i.nome}</span>
                        <span className="block break-all text-[0.8rem] text-tinta-suave">{i.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="block">{i.curso || "—"}</span>
                        <span className="block text-[0.85rem] text-tinta-suave">
                          {[i.disciplina, rotuloFormato(i)].filter(Boolean).join(" · ")}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="block">{textoPresenca(i)}</span>
                        <span className="block text-[0.8rem] text-tinta-suave">{i.percentual}%</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <BotaoApresentou i={i} ocupado={marcando === i.id} onAlternar={alternarApresentacao} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <SeloSituacao i={i} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <BotaoAcao destaque onClick={() => setVendo(i)} Icone={Eye} rotulo={`Ver trabalho de ${i.nome}`}>
                            Ver trabalho
                          </BotaoAcao>
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
            <ul className="divide-y divide-linea lg:hidden">
              {visiveis.map((i) => (
                <li key={i.id} className="space-y-1.5 p-4">
                  <strong className="block break-words text-navy">{i.nome}</strong>
                  <span className="block break-all text-[0.85rem] text-tinta-suave">{i.email}</span>
                  <span className="block text-[0.9rem]">
                    {i.telefone || "—"} · CPF {i.cpf}
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

            {/* Participantes: tabela no computador */}
            <div className="hidden lg:block">
              <table className="w-full table-auto text-left text-[0.95rem]">
                <thead className="bg-fundo text-[0.8rem] uppercase tracking-wide text-tinta-suave">
                  <tr>
                    <th className="px-4 py-2.5">Participante</th>
                    <th className={th}>Telefone</th>
                    <th className={th}>CPF</th>
                    <th className={th}>Presença</th>
                    <th className={th}>Certificado</th>
                    <th className="w-px px-4 py-2.5">
                      <span className="sr-only">Editar</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visiveis.map((i) => (
                    <tr key={i.id} className="border-t border-linea align-middle">
                      <td className="px-4 py-3">
                        <strong className="block break-words text-navy">{i.nome}</strong>
                        <span className="block break-all text-[0.8rem] text-tinta-suave">{i.email}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{i.telefone || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3">{i.cpf}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="block">{textoPresenca(i)}</span>
                        <span className="block text-[0.8rem] text-tinta-suave">{i.percentual}%</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <SeloSituacao i={i} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <BotaoAcao onClick={() => setEditando(i)} Icone={Pencil} rotulo={`Editar inscrição de ${i.nome}`}>
                          Editar
                        </BotaoAcao>
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
