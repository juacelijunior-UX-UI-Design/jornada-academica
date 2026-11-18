import { useState } from "react";
import { CloudUpload, FileCheck2, Trash2 } from "lucide-react";
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
  // Público externo não escolhe disciplina: só o formato da apresentação.
  const externo = form.tipo === "externo";
  const automatico = externo ? undefined : FORMATO_AUTOMATICO[form.disciplina];
  const total = tamanhoResumo(form.resumo);
  const [arrastando, setArrastando] = useState(false);

  function aceitarArquivo(f, input) {
    if (!f) return setArquivo(null);
    const erro = validarArquivo(f);
    if (erro) {
      setArquivo(null);
      if (input) input.value = "";
      setErro("arquivo", erro);
      return;
    }
    setErro("arquivo", "");
    setArquivo(f);
  }

  return (
    <>
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

      <div className={`grid gap-x-4 ${externo ? "" : "md:grid-cols-2"}`}>
        {!externo && (
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
        )}

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
            <option value="">Selecione o curso</option>
            {CURSOS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value={OUTROS}>Outros</option>
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

      <Campo id="resumo" label="Resumo do trabalho" erro={erros.resumo}>
        <textarea
          id="resumo"
          className="jr-input min-h-[12rem] resize-y leading-relaxed"
          rows={9}
          maxLength={RESUMO_MAX}
          value={form.resumo}
          aria-invalid={erros.resumo ? "true" : undefined}
          onChange={(e) => setCampo("resumo", e.target.value)}
        />
        <p
          className={`mb-0 mt-1 text-right text-[0.8125rem] ${
            total > RESUMO_MAX - 100 ? "text-vermelho-texto" : "text-tinta-suave"
          }`}
        >
          {total} / {RESUMO_MAX}
        </p>
      </Campo>

      <Campo id="arquivo" label="Anexar resumo do trabalho:" erro={erros.arquivo}>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setArrastando(true);
          }}
          onDragLeave={() => setArrastando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastando(false);
            aceitarArquivo(e.dataTransfer.files?.[0] || null);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-7 text-center transition-colors ${
            arrastando ? "border-royal bg-[#e9effc]" : "border-linea bg-white hover:border-royal"
          }`}
        >
          <CloudUpload className="h-8 w-8 text-navy" aria-hidden="true" />
          <span className="mt-2 font-semibold text-tinta">
            {arquivo ? arquivo.name : "Arraste o arquivo para cá ou escolha no computador"}
          </span>
          <span className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-linea bg-fundo px-4 text-[0.9rem] font-semibold text-navy">
            {arquivo ? "Trocar arquivo" : "Escolher arquivo"}
          </span>
          <span className="jr-legenda mt-2">
            Documento (PDF, DOC, DOCX ou ODT) ou slides (PPT, PPTX ou ODP), de até 10 MB.
          </span>
          <input
            id="arquivo"
            type="file"
            accept=".pdf,.doc,.docx,.odt,.ppt,.pptx,.odp"
            className="sr-only"
            onChange={(e) => aceitarArquivo(e.target.files?.[0] || null, e.target)}
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
    </>
  );
}
