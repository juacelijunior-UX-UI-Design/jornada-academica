import { createServerFn } from "@tanstack/react-start";
import {
  FORMATO_AUTOMATICO,
  DISCIPLINAS,
  INSTITUICAO_ALUNO,
  cursoPadrao,
} from "@/lib/evento";
import {
  MAX_COAUTORES,
  apenasDigitos,
  normalizarCoautores,
  normalizarFormato,
  normalizarTelefone,
  validarInscricao,
  validarParticipante,
  mascararCpf,
} from "@/lib/validacao";
import { conteudoQr, enviarConfirmacao, garantirToken } from "@/lib/ingresso.server";
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
  const externo = data.tipo === "externo";
  const erros = validarInscricao(valores);
  if (!externo && !DISCIPLINAS.includes(valores.disciplina)) erros.disciplina = "Selecione sua disciplina.";
  const formato = (!externo && FORMATO_AUTOMATICO[data.disciplina]) || normalizarFormato(data.formato);
  if (!erros.formato && !["banner", "comunicacao_oral"].includes(formato)) erros.formato = "Selecione o formato da apresentação.";
  if (Object.keys(erros).length) return { ok: false, erros };

  const cpf = apenasDigitos(data.cpf);
  const email = String(data.email).trim().toLowerCase();

  const jaExiste = await todos(base44.entities.Participante.list("-created_date"));
  const cursosCadastrados = [...new Set(jaExiste.map((p) => p.curso).filter(Boolean))];
  const porCpf = jaExiste.find((p) => p.cpf === cpf);
  const porEmail = jaExiste.find((p) => String(p.email).toLowerCase() === email);

  // Quem já se inscreveu como participante (ouvinte) pode transformar essa inscrição em submissão,
  // desde que CPF e e-mail sejam os da mesma inscrição. Mantém o QR Code e as presenças.
  const converter =
    porCpf && porEmail && porCpf.id === porEmail.id && porCpf.tipo === "participante" ? porCpf : null;

  if (!converter && (porCpf || porEmail)) {
    const dup = {};
    const avisoParticipante =
      "Use o mesmo CPF e o mesmo e-mail da sua inscrição de participante para transformá-la em submissão.";
    if (porCpf) {
      dup.cpf =
        porCpf.tipo === "participante"
          ? `Este CPF já tem inscrição de participante com outro e-mail. ${avisoParticipante}`
          : "Este CPF já tem um trabalho submetido. Cada pessoa pode submeter um trabalho.";
    }
    if (porEmail) {
      dup.email =
        porEmail.tipo === "participante"
          ? `Este e-mail já tem inscrição de participante com outro CPF. ${avisoParticipante}`
          : "Este e-mail já tem um trabalho submetido. Cada pessoa pode submeter um trabalho.";
    }
    return { ok: false, erros: dup };
  }

  const dadosSubmissao = {
    tipo: data.tipo === "externo" ? "externo" : "aluno",
    nome: String(data.nome).trim().replace(/\s+/g, " "),
    coautores: normalizarCoautores(data.coautores).slice(0, MAX_COAUTORES),
    email,
    telefone: normalizarTelefone(data.telefone),
    cpf,
    matricula: data.tipo === "externo" ? "" : soDigitosOuVazio(apenasDigitos(data.matricula)),
    instituicao: data.tipo === "externo" ? String(data.instituicao || "").trim() : INSTITUICAO_ALUNO,
    curso: cursoPadrao(data.curso, cursosCadastrados),
    disciplina: externo ? undefined : data.disciplina,
    formato,
    titulo: String(data.titulo || "").trim().replace(/\s+/g, " "),
    resumo: String(data.resumo || "").trim(),
    arquivo_uri: data.arquivo_uri || undefined,
    arquivo_nome: data.arquivo_nome || undefined,
    arquivo_tamanho: data.arquivo_tamanho ? Number(data.arquivo_tamanho) : undefined,
  };

  let participante;
  if (converter) {
    // Vira submissão nova: avaliação e apresentação começam do zero; token do QR Code e presenças ficam.
    await base44.entities.Participante.update(converter.id, {
      ...dadosSubmissao,
      avaliacao: "pendente",
      avaliacao_motivo: "",
      avaliado_em: null,
      avaliado_por: "",
      apresentou: false,
      apresentou_em: null,
      apresentou_por: "",
    });
    participante = await base44.entities.Participante.get(converter.id);
  } else {
    participante = await base44.entities.Participante.create(dadosSubmissao);
  }

  const email_enviado = await enviarConfirmacao(base44, participante);

  return {
    ok: true,
    participante: {
      convertido: Boolean(converter),
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
  const existente =
    jaExiste.find((p) => p.cpf === cpf) || jaExiste.find((p) => String(p.email).toLowerCase() === email);
  if (existente) {
    // Uma inscrição por pessoa: quem já submeteu (ou já é participante) usa o QR Code que já tem.
    const porCpf = existente.cpf === cpf;
    const dado = porCpf ? "este CPF" : "este e-mail";
    if (existente.tipo !== "participante") {
      return {
        ok: false,
        ja_inscrito: "submissao",
        erro: `Você já tem um trabalho submetido com ${dado}. Sua inscrição já vale para todas as atividades do evento: use o QR Code que enviamos por e-mail ou acesse Minha inscrição.`,
      };
    }
    return {
      ok: false,
      ja_inscrito: "participante",
      erro: `Já existe uma inscrição de participante com ${dado}. Use o QR Code que enviamos por e-mail ou acesse Minha inscrição.`,
    };
  }

  const criado = await base44.entities.Participante.create({
    tipo: "participante",
    nome: String(data.nome).trim().replace(/\s+/g, " "),
    email,
    telefone: normalizarTelefone(data.telefone),
    cpf,
  });

  // O QR Code de ingresso volta para a tela de confirmação (só para quem acabou de se inscrever).
  const participante = await garantirToken(base44, criado);
  const email_enviado = await enviarConfirmacao(base44, participante);
  return {
    ok: true,
    participante: {
      nome: participante.nome,
      cpf: mascararCpf(participante.cpf),
      qr: conteudoQr(participante),
      email_enviado,
    },
  };
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