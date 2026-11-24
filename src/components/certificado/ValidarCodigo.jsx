import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Award, BadgeCheck, CalendarDays, GraduationCap, Hash, Info, KeyRound, Loader2, ShieldCheck, User, XOctagon } from "lucide-react";
import { validarCertificado } from "@/lib/fn-certificado";

const formatarCodigo = (v) =>
  (String(v).toUpperCase().replace(/[^A-F0-9]/g, "").slice(0, 12).match(/.{1,4}/g) || []).join("-");

const utc = (d) => (/[zZ]|[+-]\d\d:?\d\d$/.test(d) ? d : `${d}Z`);
const dataBr = (d) => (d ? new Date(utc(d)).toLocaleDateString("pt-BR", { timeZone: "America/Fortaleza" }) : "");

function Dado({ Icone, rotulo, children, largo = false }) {
  return (
    <div className={`flex min-w-0 items-start gap-2.5 rounded-lg border border-[#cfe8d9] bg-white px-3 py-2.5 ${largo ? "sm:col-span-2" : ""}`}>
      <Icone className="mt-0.5 h-4 w-4 flex-none text-[#1e8e4e]" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-[0.72rem] font-bold uppercase tracking-[0.08em] text-tinta-suave">{rotulo}:</dt>
        <dd className="m-0 mt-0.5 break-words text-[0.95rem] font-medium text-tinta">{children}</dd>
      </div>
    </div>
  );
}

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
        <label htmlFor="codigo" className="jr-label">
          Código de autenticidade:
        </label>
        <div className="relative">
          <KeyRound
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-tinta-suave"
            aria-hidden="true"
          />
          <input
            id="codigo"
            className="jr-input pl-11 font-mono text-[1.1rem] uppercase tracking-[0.18em]"
            placeholder="XXXX-XXXX-XXXX"
            autoComplete="off"
            spellCheck={false}
            value={codigo}
            onChange={(e) => {
              setCodigo(formatarCodigo(e.target.value));
              if (resultado) setResultado(null);
            }}
          />
        </div>
        <p className="jr-legenda mt-1.5">12 caracteres (letras de A a F e números), separados por hífen.</p>
        <button
          type="submit"
          disabled={carregando}
          className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-amarelo px-6 py-3 font-semibold text-navy hover:bg-[#e8b800] disabled:opacity-60"
        >
          {carregando ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          )}
          {carregando ? "Validando..." : "Validar certificado"}
        </button>
      </form>

      <div className="mt-6 empty:mt-0" aria-live="polite">
        {resultado?.invalido && (
          <div className="jr-alerta jr-alerta-info">
            <Info className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
            <span>Digite o código completo, no formato XXXX-XXXX-XXXX.</span>
          </div>
        )}
        {resultado?.erro && (
          <div className="jr-alerta jr-alerta-erro" role="alert">
            <XOctagon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
            <span>Não foi possível validar agora. Tente novamente em instantes.</span>
          </div>
        )}
        {resultado?.encontrado === false && (
          <div className="overflow-hidden rounded-xl border border-[#f3b7bd]" role="alert">
            <div className="flex items-center gap-3 bg-[#fdecee] px-4 py-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#c81d28] text-white">
                <XOctagon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <strong className="block font-heading text-[1.05rem] text-[#8f1119]">Certificado não encontrado</strong>
                <span className="block text-[0.9rem] text-[#8f1119]">
                  O código <span className="font-mono font-semibold">{codigo}</span> não foi emitido pela Jornada.
                </span>
              </div>
            </div>
            <p className="m-0 bg-white px-4 py-3 text-[0.88rem] text-tinta-suave">
              Confira se digitou o código exatamente como aparece no certificado.
            </p>
          </div>
        )}
        {c && (
          <div className="overflow-hidden rounded-xl border border-[#b9e0c8]">
            <div className="flex items-center gap-3 bg-[#e8f6ee] px-4 py-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#1e8e4e] text-white">
                <BadgeCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <strong className="block font-heading text-[1.05rem] text-[#166b3b]">Certificado autêntico</strong>
                <span className="block text-[0.9rem] text-[#166b3b]">Emitido pela VI Jornada Acadêmica da UNINASSAU Teresina.</span>
              </div>
            </div>
            <dl className="m-0 grid gap-2.5 bg-[#f6fbf8] p-4 sm:grid-cols-2">
              <Dado Icone={User} rotulo="Participante" largo>
                {c.nome}
              </Dado>
              {c.curso && (
                <Dado Icone={GraduationCap} rotulo="Curso">
                  {c.curso}
                </Dado>
              )}
              <Dado Icone={Award} rotulo="Carga horária">
                {c.horas} horas
              </Dado>
              <Dado Icone={CalendarDays} rotulo="Evento" largo>
                {c.evento} · {c.datas}
              </Dado>
              <Dado Icone={Hash} rotulo="Código">
                <span className="font-mono">{c.codigo}</span>
              </Dado>
              {c.emitido_em && (
                <Dado Icone={CalendarDays} rotulo="Emitido em">
                  {dataBr(c.emitido_em)}
                </Dado>
              )}
            </dl>
          </div>
        )}
      </div>
    </>
  );
}
