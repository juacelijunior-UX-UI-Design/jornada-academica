import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { linkArquivoTrabalho } from "@/lib/fn-equipe";
import { formatarTamanho } from "@/lib/validacao";

const dataBr = (d) =>
  d ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(d) ? d : `${d}Z`).toLocaleDateString("pt-BR", { timeZone: "America/Fortaleza" }) : "";

// Janela com todos os dados do trabalho submetido, para a banca avaliar e baixar o arquivo.
export default function TrabalhoDetalhes({ inscrito: i, onFechar }) {
  const abrirLink = useServerFn(linkArquivoTrabalho);
  const [abrindo, setAbrindo] = useState(false);

  async function abrirArquivo() {
    if (abrindo) return;
    // Abre a aba já no clique (evita bloqueio de pop-up) e depois aponta para o link temporário.
    const aba = window.open("", "_blank");
    setAbrindo(true);
    try {
      const res = await abrirLink({ data: { id: i.id } });
      if (!res?.ok) {
        aba?.close();
        toast.error(res?.erro || "Não foi possível abrir o arquivo.");
        return;
      }
      if (aba) aba.location.href = res.url;
      else window.location.href = res.url;
    } catch {
      aba?.close();
      toast.error("Não foi possível abrir o arquivo. Tente novamente.");
    } finally {
      setAbrindo(false);
    }
  }

  const linhas = [
    ["Apresentador", i.nome],
    ["Co-autores", i.coautores?.length ? i.coautores.join(", ") : "Trabalho individual"],
    ["Inscrição", i.tipo === "externo" ? "Público externo" : "Aluno da instituição"],
    [i.tipo === "externo" ? "Instituição" : "Matrícula", i.tipo === "externo" ? i.instituicao : i.matricula],
    ["Curso", i.curso],
    ["Disciplina", i.disciplina],
    ["Formato", i.formato === "banner" ? "Banner" : "Comunicação oral"],
    ["E-mail", i.email],
    ["Telefone", i.telefone],
    ["CPF", i.cpf],
    ["Inscrito em", dataBr(i.criado_em)],
  ].filter(([, v]) => v);

  return (
    <Dialog open onOpenChange={(v) => !v && onFechar?.()}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b-4 border-amarelo bg-navy px-6 py-5 text-left">
          <DialogTitle className="pr-6 font-heading text-[1.25rem] leading-snug text-white">
            {i.titulo || "Trabalho sem título"}
          </DialogTitle>
          <DialogDescription className="text-[#dbe4fb]">
            {i.nome} · {i.formato === "banner" ? "Banner" : "Comunicação oral"}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(90vh-6rem)] space-y-6 overflow-y-auto px-6 py-5">
          <section>
            <h3 className="font-heading text-[1.05rem] font-bold text-navy">Arquivo do trabalho</h3>
            {i.tem_arquivo ? (
              <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-linea bg-fundo/60 p-3">
                <FileText className="h-6 w-6 flex-none text-royal" aria-hidden="true" />
                <span className="min-w-0 flex-1 break-all text-[0.95rem]">
                  {i.arquivo_nome || "Arquivo"}
                  {i.arquivo_tamanho ? (
                    <span className="text-tinta-suave"> · {formatarTamanho(i.arquivo_tamanho)}</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={abrirArquivo}
                  disabled={abrindo}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-navy px-4 font-semibold text-white transition hover:bg-royal disabled:opacity-60"
                >
                  {abrindo ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Download className="h-4 w-4" aria-hidden="true" />
                  )}
                  Abrir / baixar
                </button>
              </div>
            ) : (
              <p className="mt-2 text-tinta-suave">Nenhum arquivo enviado.</p>
            )}
          </section>

          <section>
            <h3 className="font-heading text-[1.05rem] font-bold text-navy">Resumo</h3>
            <p className="mt-2 whitespace-pre-line rounded-lg border border-linea bg-white p-4 text-[0.95rem] leading-relaxed text-tinta">
              {i.resumo || "Sem resumo."}
            </p>
          </section>

          <section>
            <h3 className="font-heading text-[1.05rem] font-bold text-navy">Dados da inscrição</h3>
            <dl className="mt-2 divide-y divide-linea text-[0.95rem]">
              {linhas.map(([rotulo, valor]) => (
                <div key={rotulo} className="grid gap-x-4 py-2 sm:grid-cols-[10rem_1fr]">
                  <dt className="font-semibold text-tinta-suave">{rotulo}</dt>
                  <dd className="min-w-0 break-words text-tinta">{valor}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
