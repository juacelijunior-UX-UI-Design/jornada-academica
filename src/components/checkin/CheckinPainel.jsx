import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, CameraOff, Loader2 } from "lucide-react";
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
      <div className="jr-card p-5">
        <label htmlFor="sessao" className="jr-label">Atividade</label>
        <select id="sessao" className="jr-input" value={sessaoId} onChange={(e) => setSessaoId(e.target.value)}>
          {dados.sessoes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.titulo} · {String(s.data).split("-").reverse().join("/")} {s.hora_inicio}
            </option>
          ))}
        </select>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <button
              type="button"
              onClick={() => setCamera((v) => !v)}
              className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-royal px-5 font-semibold text-white hover:bg-navy"
            >
              {camera ? <CameraOff className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
              {camera ? "Fechar câmera" : "Ler QR Code com a câmera"}
            </button>
            {camera && <LeitorQr onLeitura={(texto) => confirmar({ qr: texto })} />}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmar({ cpf });
            }}
          >
            <label htmlFor="cpf-rapido" className="jr-label">Ou digite o CPF</label>
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
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-amarelo px-5 font-semibold text-navy hover:bg-[#e8b800] disabled:opacity-60"
            >
              {enviando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Registrar presença
            </button>
          </form>
        </div>

        {aviso && (
          <div className={`jr-alerta mt-5 ${classeAviso[aviso.tipo]}`} role="status" aria-live="polite">
            {aviso.texto}
          </div>
        )}
      </div>

      <section>
        <h2 className="mb-3 font-heading text-[1.2rem] font-extrabold text-navy">
          Presenças registradas ({registros.length})
        </h2>
        <ListaCheckins registros={registros} />
      </section>
    </div>
  );
}