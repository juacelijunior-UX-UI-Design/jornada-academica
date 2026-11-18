// Regras de negócio da Jornada executadas no servidor (configuração, datas, presença).
import { arredondar2, percentualDe, estaElegivel } from "@/lib/regras";
import { DATA_LIBERACAO_CERTIFICADOS, apresentouTrabalho, cargaHorariaCertificado } from "@/lib/evento";

export const CONFIGURACAO_PADRAO = {
  modo_aprovacao: "presenca",
  valor_minimo: 1,
  carga_horaria_certificado: 20,
  certificados_a_partir_de: "2026-12-14",
  inscricoes_de: "2026-11-16",
  inscricoes_ate: "2026-11-30",
  ignorar_datas: false,
  coordenador_nome: "",
  reitora_nome: "Dra. Roselane Moita Pierot",
};

// Lista completa, seja qual for o formato que o SDK devolver.
export async function todos(promessa) {
  const res = await promessa;
  return Array.isArray(res) ? res : (res?.items ?? []);
}

export function hojeSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatarDataBr(data) {
  if (!data) return "";
  const [ano, mes, dia] = String(data).slice(0, 10).split("-");
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : String(data);
}

export async function obterConfiguracao(base44) {
  const registros = await todos(base44.entities.Configuracao.list("-created_date"));
  if (!registros.length) return { ...CONFIGURACAO_PADRAO };
  const { id, ...resto } = registros[0];
  return {
    ...CONFIGURACAO_PADRAO,
    ...resto,
    valor_minimo: Number(resto.valor_minimo),
    carga_horaria_certificado: Number(resto.carga_horaria_certificado),
    ignorar_datas: Boolean(resto.ignorar_datas),
  };
}

export async function salvarConfiguracao(base44, parcial) {
  const registros = await todos(base44.entities.Configuracao.list("-created_date"));
  if (registros.length) {
    await base44.entities.Configuracao.update(registros[0].id, parcial);
  } else {
    await base44.entities.Configuracao.create({ ...CONFIGURACAO_PADRAO, ...parcial });
  }
  return obterConfiguracao(base44);
}

// Inscrições: período inclusivo. Devolve null quando estão abertas.
export function motivoInscricoesFechadas(config, hoje = hojeSaoPaulo()) {
  if (config.ignorar_datas) return null;
  if (config.inscricoes_de && hoje < config.inscricoes_de) {
    return `As inscrições ainda não começaram. Elas abrem em ${formatarDataBr(config.inscricoes_de)}.`;
  }
  if (config.inscricoes_ate && hoje > config.inscricoes_ate) {
    return `As inscrições foram encerradas em ${formatarDataBr(config.inscricoes_ate)}.`;
  }
  return null;
}

// Data e hora locais no formato "AAAA-MM-DDTHH:MM", para comparar com o horário exato de liberação.
export function agoraSaoPaulo() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const p = Object.fromEntries(partes.map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour === "24" ? "00" : p.hour}:${p.minute}`;
}

// Dia em que os certificados abrem: o configurado no painel, mas nunca antes de 14/12/2026.
export function dataLiberacaoCertificados(config) {
  const configurada = String(config?.certificados_a_partir_de || "").slice(0, 10);
  return configurada > DATA_LIBERACAO_CERTIFICADOS ? configurada : DATA_LIBERACAO_CERTIFICADOS;
}

// Os certificados abrem nesse dia, às 00:01 (horário de São Paulo).
// O modo de teste (ignorar_datas) NÃO libera certificados: vale só para as datas de inscrição.
export function certificadosLiberados(config, agora = agoraSaoPaulo()) {
  return agora >= `${dataLiberacaoCertificados(config)}T00:01`;
}

export function descreverRegra(config) {
  if (config.modo_aprovacao === "presenca") return "pelo menos 1 presença registrada";
  const valor = Number(config.valor_minimo).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  return config.modo_aprovacao === "horas"
    ? `${valor} h de presença`
    : `${valor}% de presença`;
}

// Presença acumulada e elegibilidade de todos os inscritos.
export async function calcularResumo(base44, { participanteId } = {}) {
  const configuracao = await obterConfiguracao(base44);
  const [sessoes, participantes, presencas] = await Promise.all([
    todos(base44.entities.Sessao.list("data")),
    todos(base44.entities.Participante.list("nome")),
    todos(base44.entities.Presenca.list("-created_date")),
  ]);

  const cargaTotal = sessoes.reduce((soma, s) => soma + Number(s.carga_horaria || 0), 0);
  const horasPorSessao = new Map(sessoes.map((s) => [s.id, Number(s.carga_horaria || 0)]));

  const porParticipante = new Map();
  for (const p of presencas) {
    const atual = porParticipante.get(p.participante_id) || { horas: 0, presencas: 0 };
    atual.horas += horasPorSessao.get(p.sessao_id) || 0;
    atual.presencas += 1;
    porParticipante.set(p.participante_id, atual);
  }

  const alunos = participantes
    .filter((p) => !participanteId || p.id === participanteId)
    .map((p) => {
      const { horas, presencas: qtd } = porParticipante.get(p.id) || { horas: 0, presencas: 0 };
      return {
        ...p,
        presencas: qtd,
        horas_presentes: arredondar2(horas),
        percentual: arredondar2(percentualDe(horas, cargaTotal)),
        // Quem a equipe marcou como "Apresentou" esteve no evento: fica apto mesmo sem check-in.
        elegivel: apresentouTrabalho(p) || estaElegivel({ horas, presencas: qtd }, cargaTotal, configuracao),
        horas_certificado: cargaHorariaCertificado(p),
      };
    });

  return { configuracao, carga_horaria_total: arredondar2(cargaTotal), alunos };
}