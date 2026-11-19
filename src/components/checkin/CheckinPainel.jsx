import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, CameraOff, Loader2, ScanLine, UserCheck } from "lucide-react";
import CartaoFaixa, { SeloFaixa } from "@/components/painel/CartaoFaixa";
import { carregarCheckin, registrarCheckin } from "@/lib/fn-ingresso";
import { mascaraCpf } from "@/lib/validacao";
import LeitorQr from "@/components/checkin/LeitorQr";
import ListaCheckins, { formatarHora } from "@/components/checkin/ListaCheckins";

function bipe(ok) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = ok ? 880 : 220;
    g.gain.value = 0.08;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + (ok ? 0.12 : 0.3));
  } catch {
    /* sem áudio */
  }
}

export default function CheckinPainel() {
  const carregar = useServerFn(carregarCheckin);
  const registrar = useServerFn(registrarCheckin);
  const [dados, setDados] = useState(null);
  const [erroCarga, setErroCarga] = useState("");
  const [sessaoId, setSessaoId] = useState("");
  const [camera, setCamera] = useState(false);
  const [cpf, setCpf] = useState("");
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const ocupado = useRef(false);

  const recarregar = useCallback(async () => {
    try {
      const d = await carregar();
      setDados(d);
      setSessaoId((atual) => atual || d.sessoes[0]?.id || "");
    } catch {
      setErroCarga("Acesso restrito à equipe da Jornada ou falha ao carregar. Entre com uma conta autorizada.");
    }
  }, [carregar]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  async function confirmar(entrada) {
    if (ocupado.current) return;
    ocupado.current = true;
    setEnviando(true);
    try {
      const r = await registrar({ data: { ...entrada, sessao_id: sessaoId } });
      if (!r.ok) {
        setAviso({ tipo: "erro", texto: r.erro });
        bipe(false);
      } else {
        setAviso({
          tipo: r.novo ? "sucesso" : "info",
          texto: r.novo
            ? `Presença confirmada: ${r.nome} às ${formatarHora(r.hora)}.`
            : `${r.nome} já estava presente nesta atividade.`,
        });
        bipe(r.novo);
        if (entrada.cpf) setCpf("");
        // Presença registrada pelo QR Code: fecha a câmera. Para o próximo, toque em "Ler próximo QR Code".
        if (entrada.qr) setCamera(false);
        await recarregar();
      }
    } catch {
      setAviso({ tipo: "erro", texto: "Não foi possível registrar. Tente novamente." });
      bipe(false);
    } finally {
      ocupado.current = false;
      setEnviando(false);
    }
  }

  if (erroCarga) return <div className="jr-alerta jr-alerta-erro" role="alert">{erroCarga}</div>;
  if (!dados) return <p className="text-tinta-suave">Carregando...</p>;
  if (!dados.sessoes.length) return <p>Nenhuma atividade cadastrada para o check-in.</p>;

  const registros = dados.registros.filter((r) => r.sessao_id === sessaoId);
  const classeAviso = { sucesso: "jr-alerta-sucesso", info: "jr-alerta-info", erro: "jr-alerta-erro" };

  return (
    <div className="space-y-6">
      <CartaoFaixa
        Icone={ScanLine}
        titulo="Registrar presença"
        descricao="Escolha a atividade e leia o QR Code do ingresso, ou digite o CPF."
        extra={<SeloFaixa>{registros.length} presença(s) nesta atividade</SeloFaixa>}
      >
        <label htmlFor="sessao" className="jr-label">Atividade</label>
        <select id="sessao" className="jr-input" value={sessaoId} onChange={(e) => setSessaoId(e.target.value)}>
          {dados.sessoes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.titulo} · {String(s.data).split("-").reverse().join("/")} {s.hora_inicio}
            </option>
          ))}
        </select>

        <div className="mt-5 grid items-stretch gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col rounded-xl border border-linea bg-fundo/50 p-4">
            <p className="m-0 mb-3 flex items-center gap-2 font-semibold text-navy">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-navy text-[0.8rem] font-bold text-amarelo">1</span>
              Pela câmera
            </p>
            <p className="m-0 mb-3 text-[0.88rem] text-tinta-suave">
              Aponte para o QR Code do ingresso. A câmera fecha sozinha após registrar.
            </p>
            <button
              type="button"
              onClick={() => setCamera((v) => !v)}
              className={`mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-5 font-semibold transition ${
                camera ? "border-2 border-navy bg-white text-navy hover:bg-fundo" : "bg-royal text-white hover:bg-navy"
              }`}
            >
              {camera ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
              {camera
                ? "Fechar câmera"
                : aviso && aviso.tipo !== "erro"
                  ? "Ler próximo QR Code"
                  : "Ler QR Code com a câmera"}
            </button>
            {camera && (
              <div className="mt-3">
                <LeitorQr onLeitura={(texto) => confirmar({ qr: texto })} />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 md:flex-col" aria-hidden="true">
            <span className="h-px flex-1 bg-linea md:h-auto md:w-px" />
            <span className="rounded-full border border-linea bg-white px-2.5 py-1 text-[0.75rem] font-bold uppercase text-tinta-suave">ou</span>
            <span className="h-px flex-1 bg-linea md:h-auto md:w-px" />
          </div>

          <form
            className="flex min-w-0 flex-col rounded-xl border border-linea bg-fundo/50 p-4"
            onSubmit={(e) => {
              e.preventDefault();
              confirmar({ cpf });
            }}
          >
            <p className="m-0 mb-3 flex items-center gap-2 font-semibold text-navy">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-navy text-[0.8rem] font-bold text-amarelo">2</span>
              Pelo CPF
            </p>
            <label htmlFor="cpf-rapido" className="jr-label">CPF do participante:</label>
            <input
              id="cpf-rapido"
              className="jr-input"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(mascaraCpf(e.target.value))}
            />
            <button
              type="submit"
              disabled={enviando}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-amarelo px-5 font-semibold text-navy hover:bg-[#e8b800] disabled:opacity-60"
            >
              {enviando ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserCheck className="h-4 w-4" aria-hidden="true" />}
              Registrar presença
            </button>
          </form>
        </div>

        {aviso && (
          <div className={`jr-alerta mt-5 ${classeAviso[aviso.tipo]}`} role="status" aria-live="polite">
            {aviso.texto}
          </div>
        )}
      </CartaoFaixa>

      <section>
        <h2 className="mb-3 font-heading text-[1.2rem] font-extrabold text-navy">
          Presenças registradas ({registros.length})
        </h2>
        <ListaCheckins registros={registros} />
      </section>
    </div>
  );
}