import { FORMATOS } from "@/lib/evento";

const utc = (d) => (/[zZ]|[+-]\d\d:?\d\d$/.test(d) ? d : `${d}Z`);
const dataBr = (d) =>
  d
    ? new Date(utc(d)).toLocaleDateString("pt-BR", { timeZone: "America/Fortaleza" })
    : "—";

export default function DadosInscricao({ inscricao }) {
  const linhas = [
    ["Nome", inscricao.nome],
    ["E-mail", inscricao.email],
    ["Telefone", inscricao.telefone],
    ["CPF", inscricao.cpf],
    [inscricao.tipo === "aluno" ? "Matrícula" : "Instituição", inscricao.tipo === "aluno" ? inscricao.matricula : inscricao.instituicao],
    ["Curso", inscricao.curso],
    ["Disciplina", inscricao.disciplina],
    ["Formato", FORMATOS[inscricao.formato] || inscricao.formato],
    ["Título do trabalho", inscricao.titulo],
    ["Arquivo enviado", inscricao.arquivo_nome],
    ["Inscrição realizada em", dataBr(inscricao.criado_em)],
  ].filter(([, v]) => v);

  return (
    <section className="jr-card p-5 sm:p-6">
      <h2 className="mb-1 font-heading text-[1.15rem] font-extrabold text-navy">Dados da inscrição</h2>
      <p className="jr-legenda mb-4">
        {inscricao.coautores?.length
          ? `Co-autores: ${inscricao.coautores.join(", ")}`
          : "Trabalho individual."}
      </p>
      <dl className="divide-y divide-linea text-[0.95rem]">
        {linhas.map(([rotulo, valor]) => (
          <div key={rotulo} className="flex flex-wrap gap-x-3 py-2.5">
            <dt className="w-56 flex-none font-semibold text-tinta-suave">{rotulo}</dt>
            <dd className="min-w-0 flex-1 text-tinta">{valor}</dd>
          </div>
        ))}
      </dl>
      {inscricao.resumo && (
        <div className="mt-4">
          <h3 className="jr-label">Resumo</h3>
          <p className="whitespace-pre-line text-[0.95rem] text-tinta">{inscricao.resumo}</p>
        </div>
      )}
    </section>
  );
}