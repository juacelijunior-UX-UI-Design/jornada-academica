import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, FileText, Loader2, Lock, Send, TriangleAlert } from "lucide-react";
import { emitirCertificados } from "@/lib/fn-admin";

// Emissão em lote dos certificados de quem está apto (só a partir da data de liberação).
export default function EmissaoCard({ admin, onAtualizar }) {
  const emitir = useServerFn(emitirCertificados);
  const [emAndamento, setEmAndamento] = useState(null);
  const [resultado, setResultado] = useState(null);

  const elegiveis = admin?.total_elegiveis ?? 0;
  const liberado = Boolean(admin?.liberado);

  async function executar(simular) {
    if (emAndamento) return;
    if (
      !simular &&
      !window.confirm(`Emitir os certificados de quem está apto pela regra atual (${elegiveis})? Quem já recebeu é pulado.`)
    )
      return;

    setEmAndamento(simular ? "simular" : "emitir");
    setResultado(null);
    try {
      const res = await emitir({ data: simular ? { simular: true } : {} });
      if (!res?.ok) {
        setResultado({ tipo: "erro", texto: res?.erro || "Não foi possível emitir." });
        return;
      }
      setResultado({
        tipo: "sucesso",
        texto: simular
          ? `Simulação: ${res.emitidos} receberiam agora e ${res.ja_emitidos} já receberam. Nada foi emitido.`
          : `Emissão concluída: ${res.emitidos} emitido(s), ${res.ja_emitidos} já tinham recebido.`,
      });
      onAtualizar?.();
    } catch {
      setResultado({
        tipo: "erro",
        texto: "Falha na emissão. Aguarde um pouco e use Simular para conferir quantos já receberam.",
      });
    } finally {
      setEmAndamento(null);
    }
  }

  return (
    <section className="jr-card p-5 sm:p-6" aria-labelledby="titulo-emissao">
      <h2 id="titulo-emissao" className="font-heading text-[1.2rem] font-extrabold text-navy">
        Emissão de certificados
      </h2>

      {liberado ? (
        <p className="jr-alerta jr-alerta-sucesso mt-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <span>Os certificados já podem ser emitidos.</span>
        </p>
      ) : (
        <p className="jr-alerta jr-alerta-info mt-3">
          <Lock className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <span>
            Bloqueado até <strong>{admin?.liberacao}</strong>. Antes disso, ninguém consegue emitir nem baixar
            certificados.
          </span>
        </p>
      )}

      <p className="mt-4 text-[0.95rem] text-tinta">
        {elegiveis
          ? `${elegiveis} pessoa(s) apta(s) pela regra atual. Quem já recebeu é pulado.`
          : "Ninguém está apto pela regra atual ainda."}
      </p>
      <p className="jr-legenda mt-1">
        "Simular" mostra quantos receberiam, sem emitir nada. Os inscritos também podem baixar o próprio
        certificado na página Certificado, com CPF e e-mail.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <button
          type="button"
          onClick={() => executar(true)}
          disabled={Boolean(emAndamento)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-royal px-4 font-semibold text-royal transition hover:bg-royal hover:text-white disabled:opacity-60"
        >
          {emAndamento === "simular" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
          Simular
        </button>
        <button
          type="button"
          onClick={() => executar(false)}
          disabled={Boolean(emAndamento) || elegiveis === 0 || !liberado}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-royal px-4 font-semibold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:bg-[#e3e8f4] disabled:text-[#3f4a6b]"
        >
          {emAndamento === "emitir" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          Emitir certificados
        </button>
      </div>

      {resultado && (
        <div
          className={`jr-alerta mt-4 ${resultado.tipo === "sucesso" ? "jr-alerta-sucesso" : "jr-alerta-erro"}`}
          role={resultado.tipo === "sucesso" ? "status" : "alert"}
        >
          {resultado.tipo === "sucesso" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          ) : (
            <TriangleAlert className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          )}
          <span>{resultado.texto}</span>
        </div>
      )}
    </section>
  );
}
