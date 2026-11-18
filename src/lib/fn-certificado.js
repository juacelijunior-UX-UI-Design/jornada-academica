import { createServerFn } from "@tanstack/react-start";
import { apenasDigitos, mascaraCpf } from "@/lib/validacao";
import { EVENTO, cargaHorariaCertificado } from "@/lib/evento";
import { CODIGO_VALIDO, garantirCertificado } from "@/lib/certificado.server";
import {
  calcularResumo,
  certificadosLiberados,
  dataLiberacaoCertificados,
  formatarDataBr,
  obterConfiguracao,
  todos,
} from "@/lib/jornada.server";

// Validação pública pelo código de autenticidade: mostra só nome, curso, horas e evento.
export const validarCertificado = createServerFn({ method: "POST" }).handler(async ({ data, context }) => {
  const codigo = String(data?.codigo || "").trim().toUpperCase().slice(0, 20);
  if (!CODIGO_VALIDO.test(codigo)) return { encontrado: false };
  const base44 = context.getBase44().asServiceRole;
  if (!certificadosLiberados(await obterConfiguracao(base44))) return { encontrado: false };
  const cert = (await todos(base44.entities.Certificado.filter({ codigo })))[0];
  if (!cert) return { encontrado: false };
  let participante = null;
  try {
    participante = await base44.entities.Participante.get(cert.participante_id);
  } catch {
    participante = null;
  }
  const curso = participante?.curso || "";
  return {
    encontrado: true,
    certificado: {
      codigo,
      nome: cert.nome,
      curso,
      horas: cargaHorariaCertificado(participante),
      evento: EVENTO.nome,
      datas: EVENTO.datas,
      emitido_em: cert.emitido_em || cert.created_date,
    },
  };
});

// Consulta pública do certificado: CPF e e-mail juntos. Nunca revela se um CPF existe.
export const consultarCertificado = createServerFn({ method: "POST" }).handler(async ({ data, context }) => {
  const base44 = context.getBase44().asServiceRole;
  const config = await obterConfiguracao(base44);

  if (!certificadosLiberados(config)) {
    return {
      status: "ainda_nao_liberado",
      certificados_a_partir_de: dataLiberacaoCertificados(config),
      liberado_em: formatarDataBr(dataLiberacaoCertificados(config)),
    };
  }

  const cpf = apenasDigitos(data.cpf);
  const email = String(data.email || "").trim().toLowerCase();
  if (cpf.length !== 11 || !email) return { status: "nao_encontrado" };

  const encontrados = await todos(base44.entities.Participante.filter({ cpf }));
  const aluno = encontrados.find((p) => String(p.email).toLowerCase() === email);
  if (!aluno) return { status: "nao_encontrado" };

  const { alunos } = await calcularResumo(base44, { participanteId: aluno.id });
  const resumo = alunos[0];
  const minimo = { modo_aprovacao: config.modo_aprovacao, valor_minimo: config.valor_minimo };
  const primeiroNome = String(aluno.nome).trim().split(/\s+/)[0];

  const presenca = {
    horas: resumo?.horas_presentes ?? 0,
    percentual: resumo?.percentual ?? 0,
    presencas: resumo?.presencas ?? 0,
  };

  if (!resumo?.elegivel) {
    return { status: "nao_elegivel", primeiro_nome: primeiroNome, presenca, minimo };
  }

  const codigo = await garantirCertificado(base44, resumo);

  return {
    status: "aprovado",
    primeiro_nome: primeiroNome,
    presenca,
    minimo,
    certificado: {
      codigo,
      nome: aluno.nome,
      cpf: mascaraCpf(aluno.cpf),
      curso: aluno.curso,
      horas: cargaHorariaCertificado(aluno),
      reitora_nome: config.reitora_nome,
      coordenador_nome: config.coordenador_nome,
      evento: EVENTO.nome,
      datas: EVENTO.datas,
      local: EVENTO.local,
    },
  };
});