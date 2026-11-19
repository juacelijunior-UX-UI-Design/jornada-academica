import { createServerFn } from "@tanstack/react-start";
import { requireUser } from "@/lib/auth-middleware";
import { apenasDigitos, mascararCpf, normalizarTelefone } from "@/lib/validacao";
import { calcularResumo, descreverRegra, todos } from "@/lib/jornada.server";
import { EMAIL, acessoDe, permitido } from "@/lib/painel-equipe.server";
import { INSTITUICAO_ALUNO } from "@/lib/evento";
import { PERFIS_AVALIACAO, PERFIS_EQUIPE, PERFIS_GESTAO, PERFIS_INSCRICAO, PERFIS_PARTICIPANTES } from "@/lib/perfis";

const lista = (res) => (Array.isArray(res) ? res : (res?.items ?? []));

export const meuAcesso = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => acessoDe(context.getBase44().asServiceRole, context.user));

export const resumoPainel = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44().asServiceRole;
    const acesso = await acessoDe(base44, context.user);
    // Números do evento: só para administrador, suporte e professor (o monitor não vê a Visão geral).
    if (!permitido(acesso.perfil, PERFIS_GESTAO)) return { ...acesso, numeros: null };
    const ehAdmin = acesso.perfil === "administrador";
    const contar = (entidade, filtro = {}) => base44.entities[entidade].count(filtro).catch(() => 0);
    const [inscritos, participantes, apresentados, presencas, certificados, sessoes, pedidosCheckin] =
      await Promise.all([
        contar("Participante"),
        contar("Participante", { tipo: "participante" }),
        contar("Participante", { apresentou: true }),
        contar("Presenca"),
        contar("Certificado"),
        contar("Sessao"),
        ehAdmin ? contar("SolicitacaoCheckin", { status: "pendente" }) : Promise.resolve(0),
      ]);
    const submissoes = Math.max(0, inscritos - participantes);
    return {
      ...acesso,
      numeros: {
        inscritos,
        submissoes,
        participantes,
        apresentados,
        presencas,
        certificados,
        sessoes,
        pedidosCheckin,
      },
    };
  });

export const listarUsuarios = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (perfil !== "administrador") return { ok: false, erro: "Apenas administradores gerenciam usuários." };

    const [contas, membros] = await Promise.all([
      base44.entities.User.list(),
      todos(base44.entities.Equipe.list("nome")),
    ]);
    return {
      ok: true,
      membros: membros.map((m) => ({
        id: m.id,
        nome: m.nome,
        email: m.email,
        perfil: m.perfil,
        ativo: m.ativo !== false,
      })),
      contas: lista(contas).map((u) => ({
        id: u.id,
        nome: u.full_name || "",
        email: u.email,
        role: u.role,
      })),
    };
  });

export const salvarMembro = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (perfil !== "administrador") return { ok: false, erro: "Apenas administradores alteram perfis." };

    const nome = String(data?.nome || "").trim().slice(0, 120);
    const email = String(data?.email || "").trim().toLowerCase();
    const novoPerfil = String(data?.perfil || "");
    if (!nome) return { ok: false, erro: "Informe o nome." };
    if (!EMAIL.test(email)) return { ok: false, erro: "E-mail inválido." };
    if (!PERFIS_EQUIPE.includes(novoPerfil)) return { ok: false, erro: "Perfil inválido." };

    const ativo = data?.ativo !== false;
    if (data?.id) {
      await base44.entities.Equipe.update(data.id, { nome, email, perfil: novoPerfil, ativo });
      return { ok: true };
    }

    const existentes = await todos(base44.entities.Equipe.filter({ email }));
    if (existentes.length) {
      await base44.entities.Equipe.update(existentes[0].id, { nome, email, perfil: novoPerfil, ativo: true });
      return { ok: true };
    }
    await base44.entities.Equipe.create({ nome, email, perfil: novoPerfil, ativo: true });
    return { ok: true };
  });

// Convida a pessoa (ela define a própria senha no primeiro acesso) e já define o perfil.
export const convidarUsuario = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (perfil !== "administrador") return { ok: false, erro: "Apenas administradores convidam usuários." };

    const nome = String(data?.nome || "").trim().slice(0, 120);
    const email = String(data?.email || "").trim().toLowerCase();
    const novoPerfil = String(data?.perfil || "");
    if (!EMAIL.test(email)) return { ok: false, erro: "E-mail inválido." };
    if (!PERFIS_EQUIPE.includes(novoPerfil)) return { ok: false, erro: "Perfil inválido." };

    let convite = "enviado";
    try {
      await base44.users.inviteUser(email, "user");
    } catch {
      convite = "existente";
    }

    const existentes = await todos(base44.entities.Equipe.filter({ email }));
    const dados = { nome: nome || email, email, perfil: novoPerfil, ativo: true };
    if (existentes.length) await base44.entities.Equipe.update(existentes[0].id, dados);
    else await base44.entities.Equipe.create(dados);

    return { ok: true, convite };
  });

export const removerMembro = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (perfil !== "administrador") return { ok: false, erro: "Apenas administradores removem perfis." };
    if (!data?.id) return { ok: false, erro: "Registro inválido." };
    await base44.entities.Equipe.delete(data.id);
    return { ok: true };
  });

// Alunos e participantes inscritos (professores também consultam).
export const listarInscritos = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (!permitido(perfil, PERFIS_INSCRICAO)) return { ok: false, erro: "Seu perfil não gerencia inscrições." };

    const { alunos: todosInscritos, configuracao, carga_horaria_total } = await calcularResumo(base44);
    // O professor só vê as submissões (trabalhos); participantes ouvintes ficam com administração e suporte.
    const veParticipantes = permitido(perfil, PERFIS_PARTICIPANTES);
    const alunos = veParticipantes ? todosInscritos : todosInscritos.filter((a) => a.tipo !== "participante");
    return {
      ok: true,
      perfil,
      pode_ver_participantes: veParticipantes,
      pode_editar: veParticipantes,
      pode_avaliar: permitido(perfil, PERFIS_AVALIACAO),
      regra: descreverRegra(configuracao),
      carga_horaria_total,
      total: alunos.length,
      inscritos: alunos.map((a) => ({
        id: a.id,
        tipo: a.tipo,
        nome: a.nome,
        email: a.email,
        telefone: a.telefone,
        matricula: a.matricula || "",
        instituicao: a.tipo === "aluno" ? a.instituicao || INSTITUICAO_ALUNO : a.instituicao || "",
        curso: a.curso || "",
        disciplina: a.disciplina || "",
        formato: a.formato,
        titulo: a.titulo || "",
        resumo: a.resumo || "",
        coautores: Array.isArray(a.coautores) ? a.coautores : [],
        cpf: mascararCpf(a.cpf),
        arquivo_nome: a.arquivo_nome || "",
        arquivo_tamanho: a.arquivo_tamanho || 0,
        tem_arquivo: Boolean(a.arquivo_uri),
        criado_em: a.created_date || "",
        presencas: a.presencas,
        horas: a.horas_presentes,
        percentual: a.percentual,
        elegivel: a.elegivel,
        apresentou: a.apresentou === true,
        horas_certificado: a.horas_certificado,
        avaliacao: a.avaliacao === "aprovado" || a.avaliacao === "negado" ? a.avaliacao : "pendente",
        avaliacao_motivo: a.avaliacao_motivo || "",
        avaliado_por: a.avaliado_por || "",
        avaliado_em: a.avaliado_em || "",
      })),
    };
  });

export const atualizarInscrito = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (!permitido(perfil, PERFIS_PARTICIPANTES)) return { ok: false, erro: "Seu perfil não edita inscrições." };
    if (!data?.id) return { ok: false, erro: "Registro inválido." };

    const nome = String(data.nome || "").trim().slice(0, 150);
    const email = String(data.email || "").trim().toLowerCase().slice(0, 150);
    const telefone = normalizarTelefone(data.telefone).slice(0, 11);
    if (nome.split(/\s+/).filter(Boolean).length < 2) return { ok: false, erro: "Informe nome e sobrenome." };
    if (!EMAIL.test(email)) return { ok: false, erro: "E-mail inválido." };
    if (telefone.length < 10) return { ok: false, erro: "Telefone com DDD inválido." };

    // Só altera os campos enviados: o participante (ouvinte) não tem instituição, curso nem título.
    const alteracoes = { nome, email, telefone };
    if ("instituicao" in data) alteracoes.instituicao = String(data.instituicao || "").trim().slice(0, 150);
    if ("curso" in data) alteracoes.curso = String(data.curso || "").trim().slice(0, 100);
    if ("titulo" in data) alteracoes.titulo = String(data.titulo || "").trim().slice(0, 200);
    await base44.entities.Participante.update(data.id, alteracoes);
    return { ok: true };
  });

// Link temporário (20 minutos) para a banca abrir o arquivo do trabalho, que fica guardado em área privada.
export const linkArquivoTrabalho = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (!permitido(perfil, PERFIS_INSCRICAO)) return { ok: false, erro: "Seu perfil não acessa os trabalhos." };
    if (!data?.id) return { ok: false, erro: "Registro inválido." };

    let p = null;
    try {
      p = await base44.entities.Participante.get(data.id);
    } catch {
      p = null;
    }
    if (!p?.arquivo_uri) return { ok: false, erro: "Este trabalho não tem arquivo enviado." };

    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri: p.arquivo_uri,
        expires_in: 1200,
      });
      return { ok: true, url: signed_url, nome: p.arquivo_nome || "arquivo-do-trabalho" };
    } catch {
      return { ok: false, erro: "Não foi possível abrir o arquivo agora. Tente novamente." };
    }
  });

// Marca (ou desmarca) que o trabalho foi apresentado. Só quem apresentou recebe o certificado de 20 horas.
export const marcarApresentacao = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (!permitido(perfil, PERFIS_INSCRICAO)) return { ok: false, erro: "Seu perfil não marca apresentações." };
    if (!data?.id) return { ok: false, erro: "Registro inválido." };

    let p = null;
    try {
      p = await base44.entities.Participante.get(data.id);
    } catch {
      p = null;
    }
    if (!p) return { ok: false, erro: "Inscrição não encontrada." };
    if (p.tipo === "participante") return { ok: false, erro: "Participantes (ouvintes) não apresentam trabalho." };

    const apresentou = data.apresentou === true;
    if (apresentou && p.avaliacao === "negado") {
      return { ok: false, erro: "Este trabalho foi negado na avaliação. Aprove-o antes de marcar a apresentação." };
    }
    await base44.entities.Participante.update(p.id, {
      apresentou,
      apresentou_em: apresentou ? new Date().toISOString() : null,
      apresentou_por: apresentou ? String(context.user?.email || "") : "",
    });
    return { ok: true, apresentou };
  });

// Aprova, nega ou volta para "aguardando" uma submissão. Feito pelo professor (ou administração/suporte).
export const avaliarSubmissao = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (!permitido(perfil, PERFIS_AVALIACAO)) return { ok: false, erro: "Seu perfil não avalia submissões." };
    if (!data?.id) return { ok: false, erro: "Registro inválido." };
    const decisao = ["aprovado", "negado", "pendente"].includes(data.decisao) ? data.decisao : null;
    if (!decisao) return { ok: false, erro: "Decisão inválida." };

    let p = null;
    try {
      p = await base44.entities.Participante.get(data.id);
    } catch {
      p = null;
    }
    if (!p) return { ok: false, erro: "Inscrição não encontrada." };
    if (p.tipo === "participante") return { ok: false, erro: "Participantes (ouvintes) não têm trabalho para avaliar." };

    const motivo = decisao === "pendente" ? "" : String(data.motivo || "").trim().slice(0, 500);
    const alteracoes = {
      avaliacao: decisao,
      avaliacao_motivo: motivo,
      avaliado_em: decisao === "pendente" ? null : new Date().toISOString(),
      avaliado_por: decisao === "pendente" ? "" : String(context.user?.email || ""),
    };
    // Trabalho negado não pode continuar marcado como apresentado.
    if (decisao === "negado" && p.apresentou) {
      alteracoes.apresentou = false;
      alteracoes.apresentou_em = null;
      alteracoes.apresentou_por = "";
    }
    await base44.entities.Participante.update(p.id, alteracoes);
    return { ok: true, avaliacao: decisao, desmarcou_apresentacao: Boolean(alteracoes.apresentou === false) };
  });

// Usado pelo painel para conferir o CPF digitado (a lista traz o CPF mascarado).
export const idsPorCpf = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (!permitido(perfil, PERFIS_INSCRICAO)) return [];
    const cpf = apenasDigitos(data?.cpf);
    if (cpf.length < 3) return [];
    const encontrados = await todos(
      base44.entities.Participante.filter(cpf.length === 11 ? { cpf } : { cpf: { $regex: cpf } })
    );
    return encontrados.map((p) => p.id);
  });