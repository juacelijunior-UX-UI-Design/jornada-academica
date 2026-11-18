import { createServerFn } from "@tanstack/react-start";
import {
  FORMATO_AUTOMATICO,
  DISCIPLINAS,
} from "@/lib/evento";
import {
  MAX_COAUTORES,
  apenasDigitos,
  normalizarCoautores,
  normalizarFormato,
  normalizarTelefone,
  validarInscricao,
  validarParticipante,
} from "@/lib/validacao";
import { enviarConfirmacao } from "@/lib/ingresso.server";
import { motivoInscricoesFechadas, obterConfiguracao, todos } from "@/lib/jornada.server";

const soDigitosOuVazio = (v) => (typeof v === "string" ? v : "");

// Inscrição pública de trabalho. Valida tudo de novo no servidor antes de gravar.
export const criarInscricao = createServerFn({ method: "POST" }).handler(async ({ data, context }) => {
  const base44 = context.getBase44().asServiceRole;
  const config = await obterConfiguracao(base44);

  const fechada = motivoInscricoesFechadas(config);
  if (fechada) return { ok: false, erro: fechada, erros: {} };

  const valores = {
    ...data,
    telefone: data.telefone,
    arquivo: data.arquivo_nome ? { name: data.arquivo_nome, size: Number(data.arquivo_tamanho) || 0 } : null,
  };
  const erros = validarInscricao(valores);
  if (!DISCIPLINAS.includes(valores.disciplina)) erros.disciplina = "Selecione sua disciplina.";
  if (Object.keys(erros).length) return { ok: false, erros };

  const cpf = apenasDigitos(data.cpf);
  const email = String(data.email).trim().toLowerCase();

  const jaExiste = await todos(base44.entities.Participante.list("-created_date"));
  const dup = {};
  if (jaExiste.some((p) => p.cpf === cpf)) dup.cpf = "Este CPF já está cadastrado.";
  if (jaExiste.some((p) => String(p.email).toLowerCase() === email)) dup.email = "Este e-mail já está cadastrado.";
  if (Object.keys(dup).length) return { ok: false, erros: dup };

  const formato = FORMATO_AUTOMATICO[data.disciplina] || normalizarFormato(data.formato);
  const participante = await base44.entities.Participante.create({
    tipo: data.tipo === "externo" ? "externo" : "aluno",
    nome: String(data.nome).trim().replace(/\s+/g, " "),
    coautores: normalizarCoautores(data.coautores).slice(0, MAX_COAUTORES),
    email,
    telefone: normalizarTelefone(data.telefone),
    cpf,
    matricula: data.tipo === "externo" ? "" : soDigitosOuVazio(apenasDigitos(data.matricula)),
    instituicao: data.tipo === "externo" ? String(data.instituicao || "").trim() : undefined,
    curso: String(data.curso).trim(),
    disciplina: data.disciplina,
    formato,
    titulo: String(data.titulo || "").trim().replace(/\s+/g, " "),
    resumo: String(data.resumo || "").trim(),
    arquivo_uri: data.arquivo_uri || undefined,
    arquivo_nome: data.arquivo_nome || undefined,
    arquivo_tamanho: data.arquivo_tamanho ? Number(data.arquivo_tamanho) : undefined,
  });

  const email_enviado = await enviarConfirmacao(base44, participante);

  return {
    ok: true,
    participante: {
      email_enviado,
      nome: participante.nome,
      formato: participante.formato,
      tem_resumo: Boolean(participante.resumo),
      tem_arquivo: Boolean(participante.arquivo_uri),
    },
  };
});

// Inscrição de participante (ouvinte, sem trabalho): nome, CPF, telefone e e-mail.
// Vale também depois do período de submissão, para quem só vai assistir.
export const criarParticipacao = createServerFn({ method: "POST" }).handler(async ({ data, context }) => {
  const base44 = context.getBase44().asServiceRole;

  const erros = validarParticipante(data || {});
  if (Object.keys(erros).length) return { ok: false, erros };

  const cpf = apenasDigitos(data.cpf);
  const email = String(data.email).trim().toLowerCase();

  const jaExiste = await todos(base44.entities.Participante.list("-created_date"));
  const dup = {};
  if (jaExiste.some((p) => p.cpf === cpf)) dup.cpf = "Este CPF já está cadastrado.";
  if (jaExiste.some((p) => String(p.email).toLowerCase() === email)) dup.email = "Este e-mail já está cadastrado.";
  if (Object.keys(dup).length) return { ok: false, erros: dup };

  const participante = await base44.entities.Participante.create({
    tipo: "participante",
    nome: String(data.nome).trim().replace(/\s+/g, " "),
    email,
    telefone: normalizarTelefone(data.telefone),
    cpf,
  });

  const email_enviado = await enviarConfirmacao(base44, participante);
  return { ok: true, participante: { nome: participante.nome, email_enviado } };
});

// Situação atual das inscrições (usada pela página de inscrição).
export const situacaoInscricoes = createServerFn({ method: "GET" }).handler(async ({ context }) => {
  const base44 = context.getBase44().asServiceRole;
  const config = await obterConfiguracao(base44);
  return {
    aberta: !motivoInscricoesFechadas(config),
    motivo: motivoInscricoesFechadas(config),
    de: config.inscricoes_de,
    ate: config.inscricoes_ate,
  };
});