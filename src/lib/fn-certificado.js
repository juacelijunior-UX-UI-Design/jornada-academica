import { createServerFn } from "@tanstack/react-start";
import { apenasDigitos } from "@/lib/validacao";
import { EVENTO } from "@/lib/evento";
import {
  calcularResumo,
  certificadosLiberados,
  formatarDataBr,
  obterConfiguracao,
  todos,
} from "@/lib/jornada.server";

// Consulta pública do certificado: CPF e e-mail juntos. Nunca revela se um CPF existe.
export const consultarCertificado = createServerFn({ method: "POST" }).handler(async ({ data, context }) => {
  const base44 = context.getBase44().asServiceRole;
  const config = await obterConfiguracao(base44);

  if (!certificadosLiberados(config)) {
    return {
      status: "ainda_nao_liberado",
      certificados_a_partir_de: config.certificados_a_partir_de,
      liberado_em: formatarDataBr(config.certificados_a_partir_de),
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

  if (!resumo?.elegivel) {
    return {
      status: "nao_elegivel",
      primeiro_nome: primeiroNome,
      presenca: { horas: resumo?.horas_presentes ?? 0, percentual: resumo?.percentual ?? 0 },
      minimo,
    };
  }

  return {
    status: "aprovado",
    primeiro_nome: primeiroNome,
    presenca: { horas: resumo.horas_presentes, percentual: resumo.percentual },
    minimo,
    certificado: {
      nome: aluno.nome,
      curso: aluno.curso,
      horas: config.carga_horaria_certificado,
      reitora_nome: config.reitora_nome,
      coordenador_nome: config.coordenador_nome,
      evento: EVENTO.nome,
      datas: EVENTO.datas,
      local: EVENTO.local,
    },
  };
});