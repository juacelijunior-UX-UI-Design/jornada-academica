import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardList,
  Clock,
  Download,
  FileText,
  Hash,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
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

const horaBr = (d) =>
  d
    ? new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(d) ? d : `${d}Z`).toLocaleTimeString("pt-BR", {
        timeZone: "America/Fortaleza",
        hour: "2-digit",
        minute: "2-digit",
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

// Cartão com faixa de título (usado em Autoria e em Inscrição e contato).
function Cartao({ Icone, titulo, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-linea bg-white shadow-[0_2px_10px_rgba(1,28,99,0.06)]">
      <h3 className="m-0 flex items-center gap-2 border-b border-linea bg-fundo/60 px-4 py-2.5 font-heading text-[0.8rem] font-bold uppercase tracking-[0.12em] text-navy">
        <Icone className="h-4 w-4 text-royal" aria-hidden="true" />
        {titulo}
      </h3>
      <div className="p-4">{children}</div>
    </section>
  );
}

// Um dado da inscrição: ícone, rótulo com ":" e valor embaixo.
function Dado({ Icone, rotulo, children, largo = false }) {
  return (
    <div className={`flex min-w-0 items-start gap-2.5 rounded-lg border border-linea px-3 py-2.5 ${largo ? "sm:col-span-2" : ""}`}>
      <Icone className="mt-0.5 h-4 w-4 flex-none text-royal" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-tinta-suave">{rotulo}:</dt>
        <dd className="m-0 mt-0.5 break-words text-[0.95rem] font-medium text-tinta">{children}</dd>
      </div>
    </div>
  );
}

// Iniciais do primeiro e do último nome ("Alecsandro ... Albuquerque" -> "AA").
function iniciais(nome) {
  const partes = String(nome || "").trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return `${partes[0][0]}${ultima}`.toUpperCase();
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
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl [&>button:last-child]:bg-transparent [&>button:last-child]:text-white [&>button:last-child]:opacity-90">
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

          <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <Cartao Icone={Users} titulo="Autoria">
              <div className="flex items-center gap-3 rounded-lg bg-fundo/70 p-3">
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 flex-none place-items-center rounded-full bg-navy font-heading text-[0.9rem] font-extrabold text-amarelo"
                >
                  {iniciais(i.nome)}
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.72rem] font-bold uppercase tracking-[0.1em] text-tinta-suave">Apresentador:</span>
                  <strong className="block break-words font-semibold leading-snug text-navy">{i.nome}</strong>
                </span>
              </div>

              <p className="mb-2 mt-4 flex items-center justify-between text-[0.72rem] font-bold uppercase tracking-[0.1em] text-tinta-suave">
                <span>Coautores:</span>
                <span className="rounded-full bg-fundo px-2 py-0.5 text-[0.75rem] tracking-normal text-navy">
                  {i.coautores?.length || 0}
                </span>
              </p>
              {i.coautores?.length ? (
                <ol className="m-0 list-none space-y-1.5 p-0">
                  {i.coautores.map((c, n) => (
                    <li key={c} className="flex items-start gap-2.5 text-[0.95rem] text-tinta">
                      <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-[#e9effc] text-[0.7rem] font-bold text-royal">
                        {n + 1}
                      </span>
                      <span className="min-w-0 break-words">{c}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="m-0 text-[0.95rem] text-tinta-suave">Nenhum (trabalho individual).</p>
              )}
            </Cartao>

            <Cartao Icone={ClipboardList} titulo="Inscrição e contato">
              <dl className="m-0 grid gap-2.5 sm:grid-cols-2">
                <Dado Icone={BadgeCheck} rotulo="Inscrição">
                  {externo ? "Público externo" : "Aluno da instituição"}
                </Dado>
                {externo
                  ? i.instituicao && (
                      <Dado Icone={Building2} rotulo="Instituição">
                        {i.instituicao}
                      </Dado>
                    )
                  : i.matricula && (
                      <Dado Icone={Hash} rotulo="Matrícula">
                        {i.matricula}
                      </Dado>
                    )}
                {i.criado_em && (
                  <>
                    <Dado Icone={CalendarDays} rotulo="Data da inscrição">
                      {dataBr(i.criado_em)}
                    </Dado>
                    <Dado Icone={Clock} rotulo="Horário da inscrição">
                      {horaBr(i.criado_em)}
                    </Dado>
                  </>
                )}
                <Dado Icone={Mail} rotulo="E-mail" largo>
                  <a href={`mailto:${i.email}`} title={i.email} className="break-all">
                    {i.email}
                  </a>
                </Dado>
                {i.telefone && (
                  <Dado Icone={Phone} rotulo="Telefone">
                    <a href={`tel:+55${String(i.telefone).replace(/\D/g, "")}`} className="whitespace-nowrap">
                      {telefoneBr(i.telefone)}
                    </a>
                  </Dado>
                )}
                {i.cpf && (
                  <Dado Icone={ShieldCheck} rotulo="CPF">
                    {i.cpf}
                  </Dado>
                )}
              </dl>
            </Cartao>
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
