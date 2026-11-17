import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, Loader2, XOctagon } from "lucide-react";
import { validarCertificado } from "@/lib/fn-certificado";

const formatarCodigo = (v) =>
  (String(v).toUpperCase().replace(/[^A-F0-9]/g, "").slice(0, 12).match(/.{1,4}/g) || []).join("-");

export default function ValidarCodigo({ inicial }) {
  const validar = useServerFn(validarCertificado);
  const [codigo, setCodigo] = useState(formatarCodigo(inicial || ""));
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);

  async function consultar(valor) {
    if (!/^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/.test(valor)) {
      setResultado({ invalido: true });
      return;
    }
    setCarregando(true);
    try {
      setResultado(await validar({ data: { codigo: valor } }));
    } catch {
      setResultado({ erro: true });
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    if (codigo.length === 14) consultar(codigo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const c = resultado?.certificado;

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          consultar(codigo);
        }}
        noValidate
      >
        <label htmlFor="codigo" className="jr-label">Código de autenticidade</label>
        <input
          id="codigo"
          className="jr-input font-mono uppercase"
          placeholder="XXXX-XXXX-XXXX"
          value={codigo}
          onChange={(e) => setCodigo(formatarCodigo(e.target.value))}
        />
        <button
          type="submit"
          disabled={carregando}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-amarelo px-6 py-3 font-semibold text-navy hover:bg-[#e8b800] disabled:opacity-60"
        >
          {carregando && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
          Validar certificado
        </button>
      </form>

      <div className="mt-6" aria-live="polite">
        {resultado?.invalido && (
          <div className="jr-alerta jr-alerta-info">Digite o código completo, no formato XXXX-XXXX-XXXX.</div>
        )}
        {resultado?.erro && <div className="jr-alerta jr-alerta-erro">Não foi possível validar. Tente novamente.</div>}
        {resultado?.encontrado === false && (
          <div className="jr-alerta jr-alerta-erro" role="alert">
            <XOctagon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
            <span><strong>Certificado não encontrado.</strong> Este código não foi emitido pela Jornada.</span>
          </div>
        )}
        {c && (
          <div className="jr-alerta jr-alerta-sucesso">
            <BadgeCheck className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
            <div>
              <strong>Certificado autêntico.</strong>
              <dl className="mt-2 space-y-1 text-[0.95rem]">
                <div><dt className="inline font-semibold">Participante: </dt><dd className="inline">{c.nome}</dd></div>
                {c.curso && <div><dt className="inline font-semibold">Curso: </dt><dd className="inline">{c.curso}</dd></div>}
                <div><dt className="inline font-semibold">Carga horária: </dt><dd className="inline">{c.horas} horas</dd></div>
                <div><dt className="inline font-semibold">Evento: </dt><dd className="inline">{c.evento} · {c.datas}</dd></div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </>
  );
}