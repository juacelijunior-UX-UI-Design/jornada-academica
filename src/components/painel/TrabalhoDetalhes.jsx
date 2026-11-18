import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Download, FileText, Loader2, Mail, Phone, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { linkArquivoTrabalho } from "@/lib/fn-equipe";
import { formatarTamanho } from "@/lib/validacao";

const dataBr = (d) =>
  d
    ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(d) ? d : `${d}Z`).toLocaleDateString("pt-BR", {
        timeZone: "America/Fortaleza",
      })
    : "";

const telefoneBr = (t) => {
  const d = String(t || "").replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return t || "";
};

function Secao({ titulo, children, className = "" }) {
  return (
    <section className={className}>
      <h3 className="mb-2 font-heading text-[0.8rem] font-bold uppercase tracking-[0.12em] text-tinta-suave">{titulo}</h3>
      {children}
    </section>
  );
}

function Linha({ rotulo, children }) {
  return (
    <div className="grid items-baseline gap-x-3 py-2 sm:grid-cols-[6rem_minmax(0,1fr)]">
      <dt className="whitespace-nowrap text-[0.85rem] font-semibold text-tinta-suave">{rotulo}:</dt>
      <dd className="min-w-0 break-words text-[0.95rem] text-tinta">{children}</dd>
    </div>
  );
}

// Janela com todos os dados do trabalho submetido, para a banca avaliar e baixar o arquivo.
export default function TrabalhoDetalhes({ inscrito: i, onFechar }) {
  const abrirLink = useServerFn(linkArquivoTrabalho);
  const [abrindo, setAbrindo] = useState(false);
  const formato = i.formato === "banner" ? "Banner" : "Comunicação oral";
  const externo = i.tipo === "externo";

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

  return (
    <Dialog open onOpenChange={(v) => !v && onFechar?.()}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl [&>button:last-child]:bg-transparent [&>button:last-child]:text-white [&>button:last-child]:opacity-90">
        {/* Cabeçalho: fica fixo; o conteúdo abaixo rola */}
        <DialogHeader className="flex-none border-b-4 border-amarelo bg-navy px-6 pb-4 pt-5 text-left">
          <DialogTitle className="pr-8 font-heading text-[1.2rem] leading-snug text-white sm:text-[1.3rem]">
            {i.titulo || "Trabalho sem título"}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {[formato, i.disciplina, i.curso].filter(Boolean).map((t) => (
                <span key={t} className="rounded-full bg-white/15 px-2.5 py-0.5 text-[0.8rem] font-semibold text-white">
                  {t}
                </span>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <Secao titulo="Arquivo do trabalho">
            {i.tem_arquivo ? (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-linea bg-fundo/60 p-3">
                <FileText className="h-7 w-7 flex-none text-royal" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block break-all font-semibold text-navy">{i.arquivo_nome || "Arquivo"}</span>
                  {i.arquivo_tamanho ? (
                    <span className="block text-[0.8rem] text-tinta-suave">{formatarTamanho(i.arquivo_tamanho)}</span>
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
              <p className="rounded-lg border border-dashed border-linea p-3 text-tinta-suave">Nenhum arquivo enviado.</p>
            )}
          </Secao>

          <Secao titulo="Resumo">
            <p className="whitespace-pre-line rounded-lg border border-linea bg-white p-4 text-[0.95rem] leading-relaxed text-tinta">
              {i.resumo || "Sem resumo."}
            </p>
          </Secao>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <Secao titulo="Autoria">
              <div className="rounded-lg border border-linea p-4">
                <p className="m-0 flex items-start gap-2">
                  <UserRound className="mt-0.5 h-4 w-4 flex-none text-royal" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-[0.85rem] font-semibold text-tinta-suave">Apresentador:</span>
                    <strong className="mt-1 block break-words font-semibold text-navy">{i.nome}</strong>
                  </span>
                </p>
                <div className="mt-3 flex items-start gap-2 border-t border-linea pt-3">
                  <Users className="mt-0.5 h-4 w-4 flex-none text-royal" aria-hidden="true" />
                  <div className="min-w-0">
                    <span className="block text-[0.85rem] font-semibold text-tinta-suave">
                      {i.coautores?.length ? `Co-autores (${i.coautores.length}):` : "Co-autores:"}
                    </span>
                    {i.coautores?.length ? (
                      <ol className="m-0 mt-1 list-decimal space-y-1 pl-5 text-[0.95rem] text-tinta">
                        {i.coautores.map((c) => (
                          <li key={c} className="break-words">
                            {c}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <span className="block text-[0.95rem] text-tinta-suave">Nenhum (trabalho individual)</span>
                    )}
                  </div>
                </div>
              </div>
            </Secao>

            <Secao titulo="Inscrição e contato">
              <dl className="m-0 divide-y divide-linea rounded-lg border border-linea px-4 py-1">
                <Linha rotulo="Inscrição">{externo ? "Público externo" : "Aluno da instituição"}</Linha>
                {externo ? (
                  i.instituicao && <Linha rotulo="Instituição">{i.instituicao}</Linha>
                ) : (
                  i.matricula && <Linha rotulo="Matrícula">{i.matricula}</Linha>
                )}
                <Linha rotulo="E-mail">
                  <a
                    href={`mailto:${i.email}`}
                    title={i.email}
                    className="flex min-w-0 items-center gap-1.5 whitespace-nowrap"
                  >
                    <Mail className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
                    <span className="truncate">{i.email}</span>
                  </a>
                </Linha>
                {i.telefone && (
                  <Linha rotulo="Telefone">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 flex-none text-tinta-suave" aria-hidden="true" />
                      {telefoneBr(i.telefone)}
                    </span>
                  </Linha>
                )}
                {i.cpf && <Linha rotulo="CPF">{i.cpf}</Linha>}
                {i.criado_em && <Linha rotulo="Inscrito em">{dataBr(i.criado_em)}</Linha>}
              </dl>
            </Secao>
          </div>
        </div>

        <div className="flex flex-none justify-end border-t border-linea bg-fundo/50 px-6 py-3">
          <button
            type="button"
            onClick={() => onFechar?.()}
            className="inline-flex min-h-10 items-center rounded-lg border border-linea bg-white px-5 font-semibold text-navy transition hover:bg-fundo"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
