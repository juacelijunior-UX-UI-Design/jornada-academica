import { FileCheck2, Paperclip, Trash2 } from "lucide-react";
import Campo from "@/components/inscricao/Campo";
import {
  CURSOS,
  DISCIPLINAS,
  FORMATO_AUTOMATICO,
  FORMATOS,
  OUTROS,
  RESUMO_MAX,
} from "@/lib/evento";
import { TITULO_MAX, formatarTamanho, tamanhoResumo, validarArquivo } from "@/lib/validacao";

export default function DadosTrabalho({ form, setCampo, erros, arquivo, setArquivo, setErro }) {
  const automatico = FORMATO_AUTOMATICO[form.disciplina];
  const total = tamanhoResumo(form.resumo);

  function escolherArquivo(e) {
    const f = e.target.files?.[0] || null;
    if (!f) return setArquivo(null);
    const erro = validarArquivo(f);
    if (erro) {
      setArquivo(null);
      e.target.value = "";
      setErro("arquivo", erro);
      return;
    }
    setErro("arquivo", "");
    setArquivo(f);
  }

  return (
    <>
      <div className="grid gap-x-4 md:grid-cols-2">
        <Campo id="curso" label="Curso" erro={erros.curso}>
          <select
            id="curso"
            className="jr-input"
            value={form.curso}
            aria-invalid={erros.curso ? "true" : undefined}
            onChange={(e) => {
              setCampo("curso", e.target.value);
              if (e.target.value !== OUTROS) setCampo("curso_outro", "");
            }}
          >
            <option value="">Selecione seu curso</option>
            {CURSOS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value={OUTROS}>Outros</option>
          </select>
        </Campo>

        <Campo id="disciplina" label="Disciplina" erro={erros.disciplina}>
          <select
            id="disciplina"
            className="jr-input"
            value={form.disciplina}
            aria-invalid={erros.disciplina ? "true" : undefined}
            onChange={(e) => {
              const valor = e.target.value;
              setCampo("disciplina", valor);
              setCampo("formato", FORMATO_AUTOMATICO[valor] || "");
            }}
          >
            <option value="">Selecione a disciplina</option>
            {DISCIPLINAS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      {form.curso === OUTROS && (
        <Campo id="curso_outro" label="Nome do curso" erro={erros.curso_outro}>
          <input
            id="curso_outro"
            className="jr-input"
            type="text"
            maxLength={100}
            value={form.curso_outro}
            onChange={(e) => setCampo("curso_outro", e.target.value)}
          />
        </Campo>
      )}

      <Campo
        id="formato"
        label="Formato da apresentação"
        erro={erros.formato}
        ajuda={automatico ? "Definido pelo edital para esta disciplina." : undefined}
      >
        <select
          id="formato"
          className="jr-input disabled:bg-[#eef1f8] disabled:text-tinta-suave"
          value={form.formato}
          disabled={Boolean(automatico)}
          aria-invalid={erros.formato ? "true" : undefined}
          onChange={(e) => setCampo("formato", e.target.value)}
        >
          <option value="">Selecione o formato</option>
          {Object.entries(FORMATOS).map(([valor, texto]) => (
            <option key={valor} value={valor}>
              {texto}
            </option>
          ))}
        </select>
      </Campo>

      <Campo id="titulo" label="Título do trabalho" erro={erros.titulo}>
        <input
          id="titulo"
          className="jr-input"
          type="text"
          maxLength={TITULO_MAX}
          value={form.titulo}
          aria-invalid={erros.titulo ? "true" : undefined}
          onChange={(e) => setCampo("titulo", e.target.value)}
        />
      </Campo>

      <Campo id="resumo" label="Resumo do trabalho" erro={erros.resumo}>
        <textarea
          id="resumo"
          className="jr-input min-h-[9rem] resize-y leading-relaxed"
          rows={7}
          maxLength={RESUMO_MAX}
          value={form.resumo}
          aria-invalid={erros.resumo ? "true" : undefined}
          onChange={(e) => setCampo("resumo", e.target.value)}
        />
        <p className={`mt-1 mb-0 text-right text-[0.8125rem] ${total > RESUMO_MAX - 100 ? "text-vermelho-texto" : "text-tinta-suave"}`}>
          {total}/{RESUMO_MAX}
        </p>
      </Campo>

      <Campo
        id="arquivo"
        label="Arquivo do trabalho"
        erro={erros.arquivo}
        ajuda="Formatos aceitos: PDF, DOC, DOCX ou ODT, de até 10 MB."
      >
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border-[1.5px] border-dashed border-linea bg-white px-3.5 py-2.5 text-tinta hover:border-royal">
          <Paperclip className="h-5 w-5 flex-none text-royal" aria-hidden="true" />
          <span className="truncate text-[0.95rem]">
            {arquivo ? arquivo.name : "Escolher arquivo do computador"}
          </span>
          <input
            id="arquivo"
            type="file"
            accept=".pdf,.doc,.docx,.odt"
            className="hidden"
            onChange={escolherArquivo}
          />
        </label>
        {arquivo && (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.9rem]">
            <span className="inline-flex items-center gap-2 font-semibold text-[#166b3b]">
              <FileCheck2 className="h-4 w-4" aria-hidden="true" />
              {formatarTamanho(arquivo.size)}
            </span>
            <button
              type="button"
              onClick={() => setArquivo(null)}
              className="inline-flex items-center gap-1 text-vermelho-texto underline"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Remover
            </button>
          </div>
        )}
      </Campo>

      <div className="mb-4 rounded-lg bg-[#e9effc] p-4 text-[0.95rem] text-navy">
        Usaremos seus dados somente para a inscrição, o controle de presença e a emissão do
        certificado da VI Jornada Acadêmica.
      </div>

      <div className="mb-5">
        <label className="flex cursor-pointer items-start gap-3 text-[0.95rem]">
          <input
            type="checkbox"
            checked={form.aceite}
            onChange={(e) => setCampo("aceite", e.target.checked)}
            className="mt-1 h-5 w-5 flex-none accent-[#0040ce]"
          />
          <span>Li e concordo com o uso dos meus dados para essa finalidade.</span>
        </label>
        {erros.aceite && (
          <p className="jr-erro" role="alert">
            {erros.aceite}
          </p>
        )}
      </div>
    </>
  );
}