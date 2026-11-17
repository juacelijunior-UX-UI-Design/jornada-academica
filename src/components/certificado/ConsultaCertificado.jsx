import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Download, FileText, Info, Loader2, TriangleAlert } from "lucide-react";
import { consultarCertificado } from "@/lib/fn-certificado";
import { cpfValido, mascaraCpf } from "@/lib/validacao";
import CertificadoDocumento from "@/components/certificado/CertificadoDocumento";

const num = (n) => Number(n).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

function Caixa({ tipo, titulo, texto }) {
  const estilos = {
    sucesso: { classe: "jr-alerta-sucesso", Icone: CheckCircle2 },
    info: { classe: "jr-alerta-info", Icone: Info },
    erro: { classe: "jr-alerta-erro", Icone: TriangleAlert },
  }[tipo];
  const { Icone } = estilos;
  return (
    <div className={`jr-alerta ${estilos.classe}`} role={tipo === "erro" ? "alert" : "status"}>
      <Icone className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
      <div>
        <strong className="block">{titulo}</strong>
        {texto && <p className="mb-0 mt-1">{texto}</p>}
      </div>
    </div>
  );
}

export default function ConsultaCertificado() {
  const consultar = useServerFn(consultarCertificado);
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [erros, setErros] = useState({});
  const [resultado, setResultado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [mostrarDocumento, setMostrarDocumento] = useState(false);
  const documentoRef = useRef(null);

  const linhaPresenca = (p, m) => {
    if (m.modo_aprovacao === "presenca") {
      return `Presença registrada no evento: ${p.presencas} check-in(s).`;
    }
    return m.modo_aprovacao === "horas"
      ? `Sua presença: ${num(p.horas)} h. Mínimo exigido: ${num(m.valor_minimo)} h.`
      : `Sua presença: ${num(p.percentual)}%. Mínimo exigido: ${num(m.valor_minimo)}%.`;
  };

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    const novos = {};
    if (!cpfValido(cpf)) novos.cpf = "CPF inválido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) novos.email = "E-mail inválido.";
    setErros(novos);
    if (Object.keys(novos).length) return;
    setMostrarDocumento(false);
    setEnviando(true);
    try {
      setResultado(await consultar({ data: { cpf, email: email.trim() } }));
    } catch {
      setResultado({ status: "erro" });
    } finally {
      setEnviando(false);
    }
  }

  async function baixarPdf() {
    if (!documentoRef.current || gerando) return;
    setGerando(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(documentoRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1123, 700] });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.96), "JPEG", 0, 0, 1123, 700);
      pdf.save("certificado-vi-jornada-academica.pdf");
    } finally {
      setGerando(false);
    }
  }

  return (
    <>
      <form onSubmit={enviar} noValidate>
        <div className="mb-4">
          <label htmlFor="cpf" className="jr-label">
            CPF
          </label>
          <input
            id="cpf"
            className="jr-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            value={cpf}
            aria-invalid={erros.cpf ? "true" : undefined}
            onChange={(e) => {
              setCpf(mascaraCpf(e.target.value));
              setErros((a) => ({ ...a, cpf: undefined }));
            }}
          />
          {erros.cpf && <p className="jr-erro">{erros.cpf}</p>}
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="jr-label">
            E-mail
          </label>
          <input
            id="email"
            className="jr-input"
            type="email"
            autoComplete="email"
            value={email}
            aria-invalid={erros.email ? "true" : undefined}
            onChange={(e) => {
              setEmail(e.target.value);
              setErros((a) => ({ ...a, email: undefined }));
            }}
          />
          {erros.email && <p className="jr-erro">{erros.email}</p>}
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-amarelo px-6 py-3 font-semibold text-navy transition hover:bg-[#e8b800] disabled:cursor-not-allowed disabled:bg-[#e3e8f4] disabled:text-[#3f4a6b]"
        >
          {enviando && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
          {enviando ? "Consultando..." : "Consultar"}
        </button>
      </form>

      {resultado && (
        <div className="mt-6" aria-live="polite">
          {resultado.status === "aprovado" && (
            <>
              <Caixa
                tipo="sucesso"
                titulo={`Parabéns, ${resultado.primeiro_nome}!`}
                texto={`Você atingiu a presença mínima. ${linhaPresenca(resultado.presenca, resultado.minimo)}`}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarDocumento((v) => !v)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-royal px-5 font-semibold text-royal hover:bg-royal hover:text-white"
                >
                  <FileText className="h-5 w-5" aria-hidden="true" />
                  {mostrarDocumento ? "Ocultar certificado" : "Ver certificado"}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarDocumento(true)}
                  disabled={gerando}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-royal px-5 font-semibold text-white hover:bg-navy disabled:opacity-60"
                >
                  {gerando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                  {gerando ? "Gerando PDF..." : "Baixar certificado (PDF)"}
                </button>
              </div>
            </>
          )}

          {resultado.status === "nao_elegivel" && (
            <Caixa
              tipo="info"
              titulo={
                resultado.minimo.modo_aprovacao === "presenca"
                  ? `Olá, ${resultado.primeiro_nome}. Não encontramos presença registrada no seu nome.`
                  : `Olá, ${resultado.primeiro_nome}. Sua presença não atingiu o mínimo.`
              }
              texto={
                resultado.minimo.modo_aprovacao === "presenca"
                  ? "O certificado é liberado com pelo menos um check-in feito no credenciamento ou nas atividades. Se você participou, procure a organização."
                  : linhaPresenca(resultado.presenca, resultado.minimo)
              }
            />
          )}

          {resultado.status === "ainda_nao_liberado" && (
            <Caixa
              tipo="info"
              titulo="Certificados ainda não liberados"
              texto={`Eles ficam disponíveis a partir de ${resultado.liberado_em}. Volte nessa data para consultar.`}
            />
          )}

          {resultado.status === "nao_encontrado" && (
            <Caixa
              tipo="erro"
              titulo="Não encontramos sua inscrição"
              texto="Confira se o CPF e o e-mail são os mesmos usados na inscrição."
            />
          )}

          {resultado.status === "erro" && (
            <Caixa tipo="erro" titulo="Não foi possível consultar" texto="Tente novamente em instantes." />
          )}
        </div>
      )}

      {resultado?.status === "aprovado" && (
        <div className={mostrarDocumento ? "mt-8" : "hidden"}>
          <div className="overflow-x-auto rounded-lg border border-linea bg-white p-3">
            <CertificadoDocumento ref={documentoRef} dados={resultado.certificado} />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={baixarPdf}
              disabled={gerando}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-royal px-5 font-semibold text-white hover:bg-navy disabled:opacity-60"
            >
              {gerando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              {gerando ? "Gerando PDF..." : "Baixar certificado (PDF)"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}