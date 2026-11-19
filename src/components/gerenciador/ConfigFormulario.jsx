import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, CheckSquare, Loader2, PenLine, Save } from "lucide-react";
import { toast } from "sonner";
import Campo from "@/components/inscricao/Campo";
import { salvarConfiguracoes } from "@/lib/fn-admin";
import { DATA_LIBERACAO_CERTIFICADOS } from "@/lib/evento";

const num = (n) => Number(n || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
const DATAS = ["inscricoes_de", "inscricoes_ate", "certificados_a_partir_de"];

// Bloco do formulário com título e ícone.
function Bloco({ Icone, titulo, descricao, children }) {
  return (
    <fieldset className="m-0 min-w-0 border-0 border-t border-linea p-0 pt-5 first:border-t-0 first:pt-0">
      <legend className="sr-only">{titulo}</legend>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-fundo">
          <Icone className="h-5 w-5 text-royal" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-heading text-[1.05rem] font-bold text-navy">{titulo}</h3>
          {descricao && <p className="jr-legenda mt-0.5">{descricao}</p>}
        </div>
      </div>
      {children}
    </fieldset>
  );
}

export default function ConfigFormulario({ config, cargaTotal, onSalvo }) {
  const salvar = useServerFn(salvarConfiguracoes);
  const [form, setForm] = useState({
    modo_aprovacao: config.modo_aprovacao || "presenca",
    valor_minimo: String(config.valor_minimo ?? ""),
    inscricoes_de: String(config.inscricoes_de ?? "").slice(0, 10),
    inscricoes_ate: String(config.inscricoes_ate ?? "").slice(0, 10),
    certificados_a_partir_de: String(config.certificados_a_partir_de ?? "").slice(0, 10),
    ignorar_datas: Boolean(config.ignorar_datas),
    reitora_nome: config.reitora_nome || "",
    coordenador_nome: config.coordenador_nome || "",
  });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [salvando, setSalvando] = useState(false);

  const setCampo = (campo, valor) => {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  };

  const minimo = Number(form.valor_minimo);
  const dica =
    form.modo_aprovacao === "presenca"
      ? "Basta um check-in em qualquer um dos dois dias do evento."
      : cargaTotal && minimo > 0
      ? form.modo_aprovacao === "percentual"
        ? `≈ ${num((minimo / 100) * cargaTotal)} h de ${num(cargaTotal)} h de sessões`
        : minimo > cargaTotal
          ? `Atenção: o mínimo é maior que a soma das sessões (${num(cargaTotal)} h). Ninguém seria aprovado.`
          : `Soma das sessões: ${num(cargaTotal)} h`
      : "";

  async function enviar(evento) {
    evento.preventDefault();
    if (salvando) return;
    setErroGeral("");
    const novos = {};
    if (form.modo_aprovacao !== "presenca") {
      if (!(minimo > 0)) novos.valor_minimo = "Informe um número maior que zero.";
      else if (form.modo_aprovacao === "percentual" && minimo > 100)
        novos.valor_minimo = "No modo percentual, o máximo é 100.";
    }
    DATAS.forEach((c) => {
      if (!form[c]) novos[c] = "Informe a data.";
    });
    if (!novos.inscricoes_de && !novos.inscricoes_ate && form.inscricoes_ate < form.inscricoes_de)
      novos.inscricoes_ate = "O fim não pode ser anterior ao início.";
    if (!form.reitora_nome.trim()) novos.reitora_nome = "Informe o nome da reitora.";
    if (Object.keys(novos).length) return setErros(novos);

    setSalvando(true);
    try {
      const res = await salvar({
        data: { ...form, valor_minimo: form.modo_aprovacao === "presenca" ? 1 : minimo },
      });
      if (!res?.ok) {
        if (res?.erros && Object.keys(res.erros).length) setErros(res.erros);
        if (res?.erro) setErroGeral(res.erro);
        return;
      }
      onSalvo?.(res.configuracao);
      toast.success("Configurações salvas.");
    } catch {
      setErroGeral("Não foi possível salvar. Verifique sua conexão e tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="jr-card overflow-hidden" aria-labelledby="titulo-config">
      <div className="border-b border-linea px-5 py-4 sm:px-6">
        <h2 id="titulo-config" className="font-heading text-[1.2rem] font-extrabold text-navy">
          Configurações do evento
        </h2>
        <p className="jr-legenda mt-0.5">Altere o que precisar e clique em "Salvar configurações" no fim.</p>
      </div>

      <form onSubmit={enviar} noValidate>
        <div className="space-y-6 px-5 py-5 sm:px-6">
          {erroGeral && (
            <div className="jr-alerta jr-alerta-erro" role="alert">
              {erroGeral}
            </div>
          )}

          <Bloco Icone={CheckSquare} titulo="Regra de aprovação" descricao="Quem fica apto a receber o certificado.">
            <div className="grid gap-x-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Campo id="modo_aprovacao" label="Critério de aprovação" erro={erros.modo_aprovacao}>
                <select
                  id="modo_aprovacao"
                  className="jr-input"
                  value={form.modo_aprovacao}
                  onChange={(e) => setCampo("modo_aprovacao", e.target.value)}
                >
                  <option value="presenca">Pelo menos 1 presença (check-in)</option>
                  <option value="percentual">Percentual de presença</option>
                  <option value="horas">Horas de presença</option>
                </select>
              </Campo>

              {form.modo_aprovacao === "presenca" ? (
                <div className="mb-4 flex items-end">
                  <p className="m-0 w-full rounded-lg bg-fundo px-3 py-2.5 text-[0.9rem] text-tinta">{dica}</p>
                </div>
              ) : (
                <Campo
                  id="valor_minimo"
                  label={form.modo_aprovacao === "percentual" ? "Presença mínima (%)" : "Presença mínima (horas)"}
                  erro={erros.valor_minimo}
                  ajuda={dica}
                >
                  <input
                    id="valor_minimo"
                    className="jr-input"
                    type="number"
                    min="0"
                    step="0.5"
                    inputMode="decimal"
                    value={form.valor_minimo}
                    onChange={(e) => setCampo("valor_minimo", e.target.value)}
                  />
                </Campo>
              )}
            </div>
            <p className="jr-legenda -mt-1">
              Quem a banca marcar como "Apresentou" fica apto mesmo sem check-in.
            </p>
          </Bloco>

          <Bloco Icone={CalendarDays} titulo="Datas" descricao="Período de inscrições e liberação dos certificados.">
            <div className="grid gap-x-4 sm:grid-cols-2">
              <Campo id="inscricoes_de" label="Inscrições: início" erro={erros.inscricoes_de}>
                <input
                  id="inscricoes_de"
                  className="jr-input"
                  type="date"
                  value={form.inscricoes_de}
                  onChange={(e) => setCampo("inscricoes_de", e.target.value)}
                />
              </Campo>
              <Campo id="inscricoes_ate" label="Inscrições: fim" erro={erros.inscricoes_ate}>
                <input
                  id="inscricoes_ate"
                  className="jr-input"
                  type="date"
                  value={form.inscricoes_ate}
                  onChange={(e) => setCampo("inscricoes_ate", e.target.value)}
                />
              </Campo>
              <Campo
                id="certificados_a_partir_de"
                label="Certificados a partir de"
                erro={erros.certificados_a_partir_de}
                ajuda="Nunca antes de 14/12/2026."
              >
                <input
                  id="certificados_a_partir_de"
                  className="jr-input"
                  type="date"
                  min={DATA_LIBERACAO_CERTIFICADOS}
                  value={form.certificados_a_partir_de}
                  onChange={(e) => setCampo("certificados_a_partir_de", e.target.value)}
                />
              </Campo>
            </div>

            <label
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-[0.95rem] ${
                form.ignorar_datas ? "border-[#e40822] bg-[#fdecee]" : "border-linea"
              }`}
            >
              <input
                type="checkbox"
                checked={form.ignorar_datas}
                onChange={(e) => setCampo("ignorar_datas", e.target.checked)}
                className="mt-1 h-5 w-5 flex-none accent-[#0040ce]"
              />
              <span>
                <strong className="font-semibold">Modo de teste:</strong> ignorar as datas de inscrição
                <span className="mt-0.5 block text-[0.85rem] text-tinta-suave">
                  Não afeta os certificados: eles nunca são liberados antes de 14/12/2026.
                </span>
                {form.ignorar_datas && (
                  <strong className="mt-1 block text-vermelho-texto">
                    Ligado: o sistema não respeita as datas de inscrição. Use apenas para testes.
                  </strong>
                )}
              </span>
            </label>
          </Bloco>

          <Bloco Icone={PenLine} titulo="Assinaturas do certificado" descricao="Nomes impressos no rodapé do certificado.">
            <div className="grid gap-x-4 md:grid-cols-2">
              <Campo id="reitora_nome" label="Nome da reitora" erro={erros.reitora_nome}>
                <input
                  id="reitora_nome"
                  className="jr-input"
                  type="text"
                  maxLength={150}
                  value={form.reitora_nome}
                  onChange={(e) => setCampo("reitora_nome", e.target.value)}
                />
              </Campo>
              <Campo
                id="coordenador_nome"
                label="Nome do coordenador (opcional)"
                ajuda="Sem o nome, só a assinatura da reitora aparece."
                erro={erros.coordenador_nome}
              >
                <input
                  id="coordenador_nome"
                  className="jr-input"
                  type="text"
                  maxLength={150}
                  value={form.coordenador_nome}
                  onChange={(e) => setCampo("coordenador_nome", e.target.value)}
                />
              </Campo>
            </div>
          </Bloco>
        </div>

        <div className="flex justify-end border-t border-linea bg-fundo/50 px-5 py-4 sm:px-6">
          <button
            type="submit"
            disabled={salvando}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-royal px-6 font-semibold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:bg-[#e3e8f4] disabled:text-[#3f4a6b] sm:w-auto"
          >
            {salvando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {salvando ? "Salvando…" : "Salvar configurações"}
          </button>
        </div>
      </form>
    </section>
  );
}
