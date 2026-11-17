import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, FileText, Loader2, Send, TriangleAlert } from "lucide-react";
import { emitirCertificados } from "@/lib/fn-admin";

export default function EmissaoCard({ admin, onAtualizar }) {
  const emitir = useServerFn(emitirCertificados);
  const [emAndamento, setEmAndamento] = useState(null);
  const [resultado, setResultado] = useState(null);

  const elegiveis = admin?.total_elegiveis ?? 0;
  const jaEmitidos = admin?.total_certificados ?? 0;

  async function executar(simular) {
    if (emAndamento) return;
    if (
      !simular &&
      !window.confirm(
        `Emitir os certificados de quem é elegível pela regra atual (${elegiveis})? Quem já recebeu é pulado.`
      )
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
      <h2 id="titulo-emissao" className="mb-1 font-heading text-[1.2rem] font-extrabold text-navy">
        Emissão de certificados
      </h2>
      <p className="jr-legenda mb-4">
        {admin?.liberado
          ? "Os certificados já podem ser emitidos."
          : `Os certificados só podem ser emitidos a partir de ${admin?.liberacao}.`}
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          ["Inscritos", admin?.total_inscritos ?? 0],
          ["Elegíveis pela regra", elegiveis],
          ["Certificados emitidos", jaEmitidos],
        ].map(([rotulo, valor]) => (
          <div key={rotulo} className="rounded-lg border border-linea bg-fundo px-4 py-3">
            <span className="block font-heading text-[1.6rem] font-extrabold leading-none text-navy">
              {valor}
            </span>
            <span className="text-[0.85rem] text-tinta-suave">{rotulo}</span>
          </div>
        ))}
      </div>

      <p className="mb-4 text-[0.95rem] text-tinta">
        {elegiveis
          ? `${elegiveis} aluno(s) elegível(is) pela regra atual. Quem já recebeu é pulado.`
          : "Nenhum aluno elegível pela regra atual."}
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => executar(true)}
          disabled={Boolean(emAndamento)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-royal px-5 font-semibold text-royal transition hover:bg-royal hover:text-white disabled:opacity-60"
        >
          {emAndamento === "simular" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
          Simular
        </button>
        <button
          type="button"
          onClick={() => executar(false)}
          disabled={Boolean(emAndamento) || elegiveis === 0 || !admin?.liberado}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-royal px-5 font-semibold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:bg-[#e3e8f4] disabled:text-[#3f4a6b]"
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