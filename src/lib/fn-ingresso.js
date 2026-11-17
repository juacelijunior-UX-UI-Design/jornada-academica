import { createServerFn } from "@tanstack/react-start";
import { requireUser } from "@/lib/auth-middleware";
import { apenasDigitos, cpfValido, mascararCpf } from "@/lib/validacao";
import { todos } from "@/lib/jornada.server";
import { exigirPerfil, resolverPerfil } from "@/lib/painel-equipe.server";
import { PERFIS_CHAMADA } from "@/lib/perfis";
import {
  conteudoQr,
  garantirToken,
  localizarPorQr,
  participantePorEmail,
  registrarPresencaUnica,
} from "@/lib/ingresso.server";

// Ingresso do participante logado (localizado pelo e-mail da conta, o mesmo da inscrição).
export const meuIngresso = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44().asServiceRole;
    const p = await participantePorEmail(base44, context.user.email);
    if (!p) return { encontrado: false, email: context.user.email };
    const comToken = await garantirToken(base44, p);
    return {
      encontrado: true,
      inscricao: {
        nome: comToken.nome,
        titulo: comToken.titulo || "",
        cpf: mascararCpf(comToken.cpf),
        qr: conteudoQr(comToken),
        tipo: comToken.tipo,
        email: comToken.email,
        telefone: comToken.telefone,
        matricula: comToken.matricula || "",
        instituicao: comToken.instituicao || "",
        curso: comToken.curso || "",
        disciplina: comToken.disciplina || "",
        formato: comToken.formato,
        resumo: comToken.resumo || "",
        arquivo_nome: comToken.arquivo_nome || "",
        coautores: comToken.coautores || [],
        criado_em: comToken.created_date,
      },
    };
  });

// Dados da tela de check-in: atividades e presenças já registradas.
export const carregarCheckin = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44().asServiceRole;
    const perfil = await resolverPerfil(base44, context.user);
    exigirPerfil(perfil, PERFIS_CHAMADA);
    const [sessoes, presencas, participantes] = await Promise.all([
      todos(base44.entities.Sessao.list("data")),
      todos(base44.entities.Presenca.list("-created_date", 500)),
      todos(base44.entities.Participante.list("nome")),
    ]);
    const nomes = new Map(participantes.map((p) => [p.id, p.nome]));
    return {
      sessoes: sessoes.map((s) => ({
        id: s.id,
        titulo: s.titulo,
        data: s.data,
        hora_inicio: s.hora_inicio,
        hora_fim: s.hora_fim,
      })),
      registros: presencas.map((r) => ({
        id: r.id,
        sessao_id: r.sessao_id,
        nome: nomes.get(r.participante_id) || "Participante removido",
        hora: r.created_date,
        registrado_por: r.registrado_por || "",
        status: "Presente",
      })),
    };
  });

// Check-in por QR Code (ou CPF digitado). Nunca duplica a presença.
export const registrarCheckin = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const perfil = await resolverPerfil(base44, context.user);
    exigirPerfil(perfil, PERFIS_CHAMADA);

    const sessaoId = String(data?.sessao_id || "").slice(0, 60);
    if (!sessaoId) return { ok: false, erro: "Selecione a atividade." };

    let participante = null;
    if (data?.qr) {
      const r = await localizarPorQr(base44, data.qr);
      if (r.erro) return { ok: false, erro: r.erro };
      participante = r.p;
    } else if (data?.cpf) {
      const cpf = apenasDigitos(data.cpf).slice(0, 11);
      if (!cpfValido(cpf)) return { ok: false, erro: "CPF inválido." };
      participante = (await todos(base44.entities.Participante.filter({ cpf })))[0];
      if (!participante) return { ok: false, erro: "CPF não inscrito na Jornada." };
    } else {
      return { ok: false, erro: "Informe o QR Code ou o CPF." };
    }

    const r = await registrarPresencaUnica(base44, context.user, participante, sessaoId);
    if (r.erro) return { ok: false, erro: r.erro };
    return { ok: true, novo: r.novo, nome: participante.nome, hora: r.hora };
  });