import {
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  Hash,
  Mail,
  Phone,
  Presentation,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { FORMATOS, INSTITUICAO_ALUNO } from "@/lib/evento";
import CartaoFaixa from "@/components/painel/CartaoFaixa";

const utc = (d) => (/[zZ]|[+-]\d\d:?\d\d$/.test(d) ? d : `${d}Z`);
const dataHoraBr = (d) => {
  if (!d) return "";
  const data = new Date(utc(d));
  const dia = data.toLocaleDateString("pt-BR", { timeZone: "America/Fortaleza" });
  const hora = data.toLocaleTimeString("pt-BR", { timeZone: "America/Fortaleza", hour: "2-digit", minute: "2-digit" });
  return `${dia} às ${hora}`;
};
const telefoneBr = (t) => {
  const d = String(t || "").replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return t || "";
};

const TIPOS = {
  aluno: "Submissão · Aluno da instituição",
  externo: "Submissão · Público externo",
  participante: "Participante",
};

// Um dado: ícone, rótulo com ":" e valor embaixo (mesmo padrão da janela "Ver trabalho").
function Dado({ Icone, rotulo, children, largo = false }) {
  return (
    <div className={`flex min-w-0 items-start gap-2.5 rounded-lg border border-linea bg-white px-3 py-2.5 ${largo ? "sm:col-span-2" : ""}`}>
      <Icone className="mt-0.5 h-4 w-4 flex-none text-royal" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-tinta-suave">{rotulo}:</dt>
        <dd className="m-0 mt-0.5 break-words text-[0.95rem] font-medium text-tinta">{children}</dd>
      </div>
    </div>
  );
}

function Grupo({ titulo, children }) {
  return (
    <div>
      <h3 className="mb-2.5 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-navy">{titulo}</h3>
      <dl className="m-0 grid gap-2.5 sm:grid-cols-2">{children}</dl>
    </div>
  );
}

export default function DadosInscricao({ inscricao: i }) {
  const submissao = i.tipo !== "participante";
  const aluno = i.tipo === "aluno";
  const instituicao = aluno ? i.instituicao || INSTITUICAO_ALUNO : i.instituicao;

  return (
    <CartaoFaixa
      Icone={ClipboardList}
      titulo="Dados da inscrição"
      descricao={TIPOS[i.tipo] || "Inscrição"}
      corpoClassName="space-y-6 p-5 sm:p-6"
    >
      <Grupo titulo="Dados pessoais">
        <Dado Icone={User} rotulo="Nome" largo>
          {i.nome}
        </Dado>
        <Dado Icone={Mail} rotulo="E-mail" largo>
          <span className="break-all">{i.email}</span>
        </Dado>
        {i.telefone && (
          <Dado Icone={Phone} rotulo="Telefone">
            {telefoneBr(i.telefone)}
          </Dado>
        )}
        <Dado Icone={ShieldCheck} rotulo="CPF">
          {i.cpf}
        </Dado>
        {instituicao && (
          <Dado Icone={Building2} rotulo="Instituição">
            {instituicao}
          </Dado>
        )}
        {aluno && i.matricula && (
          <Dado Icone={Hash} rotulo="Matrícula">
            {i.matricula}
          </Dado>
        )}
        {i.criado_em && (
          <Dado Icone={CalendarDays} rotulo="Inscrito em">
            {dataHoraBr(i.criado_em)}
          </Dado>
        )}
        <Dado Icone={BadgeCheck} rotulo="Modalidade">
          {submissao ? "Submissão de trabalho" : "Participante (ouvinte)"}
        </Dado>
      </Grupo>

      {submissao && (
        <Grupo titulo="Trabalho submetido">
          {i.titulo && (
            <Dado Icone={BookOpen} rotulo="Título do trabalho" largo>
              <span className="font-heading font-bold text-navy">{i.titulo}</span>
            </Dado>
          )}
          {i.curso && (
            <Dado Icone={GraduationCap} rotulo="Curso">
              {i.curso}
            </Dado>
          )}
          {i.disciplina && (
            <Dado Icone={ClipboardList} rotulo="Disciplina">
              {i.disciplina}
            </Dado>
          )}
          {i.formato && (
            <Dado Icone={Presentation} rotulo="Formato">
              {FORMATOS[i.formato] || i.formato}
            </Dado>
          )}
          {i.arquivo_nome && (
            <Dado Icone={FileText} rotulo="Arquivo enviado">
              <span className="break-all">{i.arquivo_nome}</span>
            </Dado>
          )}
          <Dado Icone={Users} rotulo={i.coautores?.length ? `Coautores (${i.coautores.length})` : "Coautores"} largo>
            {i.coautores?.length ? (
              <span className="mt-1 flex flex-wrap gap-1.5">
                {i.coautores.map((c) => (
                  <span key={c} className="rounded-full bg-[#e9effc] px-2.5 py-0.5 text-[0.85rem] font-medium text-navy">
                    {c}
                  </span>
                ))}
              </span>
            ) : (
              "Trabalho individual"
            )}
          </Dado>
        </Grupo>
      )}

      {submissao && i.resumo && (
        <details className="group rounded-lg border border-linea bg-fundo/50 open:bg-white">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold text-navy [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-royal" aria-hidden="true" />
              Resumo do trabalho
            </span>
            <span className="text-[0.85rem] font-semibold text-royal group-open:hidden">Ver resumo</span>
            <span className="hidden text-[0.85rem] font-semibold text-royal group-open:inline">Ocultar</span>
          </summary>
          <p className="m-0 whitespace-pre-line border-t border-linea px-4 py-3 text-[0.95rem] leading-relaxed text-tinta">
            {i.resumo}
          </p>
        </details>
      )}
    </CartaoFaixa>
  );
}
