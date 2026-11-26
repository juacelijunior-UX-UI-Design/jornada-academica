import { createServerFn } from "@tanstack/react-start";
import { requireUser } from "@/lib/auth-middleware";
import { apenasDigitos, cpfValido, mascararCpf } from "@/lib/validacao";
import { todos } from "@/lib/jornada.server";
import { EMAIL, acessoDe, permitido } from "@/lib/painel-equipe.server";
import { PERFIS_CHAMADA } from "@/lib/perfis";

// Pedidos de acesso à equipe de check-in: a pessoa entra com a própria conta (Google ou e-mail),
// informa nome e CPF, e o administrador aprova. Aprovada, ela vira "Monitor de Frequência".

const emailDe = (user) => String(user?.email || "").trim().toLowerCase();

async function pedidoDe(base44, email) {
  const lista = await todos(base44.entities.SolicitacaoCheckin.filter({ email }));
  return lista.sort((a, b) => String(b.created_date).localeCompare(String(a.created_date)))[0] ?? null;
}

// Situação de quem está logado: já liberado, pedido pendente/recusado ou sem pedido.
export const minhaSituacaoCheckin = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    const email = emailDe(context.user);
    const pedido = await pedidoDe(base44, email);
    return {
      liberado: permitido(perfil, PERFIS_CHAMADA),
      perfil,
      email,
      nome: context.user.full_name || "",
      pedido: pedido
        ? {
            status: pedido.status,
            nome: pedido.nome,
            cpf: pedido.cpf ? mascararCpf(pedido.cpf) : "",
            matricula: pedido.matricula || "",
            curso: pedido.curso || "",
            criado_em: pedido.created_date,
          }
        : null,
    };
  });

// Envia (ou reenvia, depois de recusado) o pedido de acesso.
export const solicitarAcessoCheckin = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (permitido(perfil, PERFIS_CHAMADA)) return { ok: true, liberado: true };

    const email = emailDe(context.user);
    const nome = String(data?.nome || "").trim().replace(/\s+/g, " ").slice(0, 150);
    const cpf = apenasDigitos(data?.cpf).slice(0, 11);
    const erros = {};
    if (nome.split(" ").filter(Boolean).length < 2) erros.nome = "Informe nome e sobrenome.";
    else if (/\d/.test(nome)) erros.nome = "O nome não pode ter números.";
    if (!cpfValido(cpf)) erros.cpf = "CPF inválido.";
    if (!data?.aceite) erros.aceite = "Aceite o uso dos dados para continuar.";
    if (Object.keys(erros).length) return { ok: false, erros };

    const atual = await pedidoDe(base44, email);
    if (atual?.status === "pendente") {
      await base44.entities.SolicitacaoCheckin.update(atual.id, { nome, cpf });
    } else {
      await base44.entities.SolicitacaoCheckin.create({ nome, email, cpf, status: "pendente" });
    }
    return { ok: true, liberado: false };
  });

// Página pública "Seja monitor": inscrição da equipe de trabalho (sem login).
// Nome, e-mail, matrícula e curso. O administrador aprova no painel; aprovada, a pessoa entra
// com esse mesmo e-mail e já fica como Monitor de Frequência.
export const inscreverMonitor = createServerFn({ method: "POST" }).handler(async ({ data, context }) => {
  const base44 = context.getBase44().asServiceRole;
  const nome = String(data?.nome || "").trim().replace(/\s+/g, " ").slice(0, 150);
  const email = String(data?.email || "").trim().toLowerCase().slice(0, 150);
  const matricula = apenasDigitos(data?.matricula).slice(0, 20);
  const curso = String(data?.curso || "").trim().slice(0, 100);

  const erros = {};
  if (nome.split(" ").filter(Boolean).length < 2) erros.nome = "Informe nome e sobrenome.";
  else if (/\d/.test(nome)) erros.nome = "O nome não pode ter números.";
  if (!EMAIL.test(email)) erros.email = "E-mail inválido.";
  if (matricula.length < 4) erros.matricula = "Informe a sua matrícula (somente números).";
  if (curso.length < 3) erros.curso = "Selecione o seu curso.";
  if (!data?.aceite) erros.aceite = "Aceite o uso dos dados para continuar.";
  if (Object.keys(erros).length) return { ok: false, erros };

  // Já faz parte da equipe com esse e-mail: não precisa de nova inscrição.
  const membros = await todos(base44.entities.Equipe.filter({ email }));
  if (membros.some((m) => m.ativo !== false)) return { ok: true, situacao: "ja_equipe" };

  const atual = await pedidoDe(base44, email);
  if (atual?.status === "pendente") {
    await base44.entities.SolicitacaoCheckin.update(atual.id, { nome, matricula, curso, origem: "monitores" });
    return { ok: true, situacao: "atualizada" };
  }
  await base44.entities.SolicitacaoCheckin.create({ nome, email, matricula, curso, origem: "monitores", status: "pendente" });
  return { ok: true, situacao: "nova" };
});

// Painel do administrador: pedidos de acesso ao check-in.
export const listarSolicitacoesCheckin = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (perfil !== "administrador") return { ok: false, erro: "Apenas administradores aprovam o acesso ao check-in." };
    const lista = await todos(base44.entities.SolicitacaoCheckin.list("-created_date"));
    return {
      ok: true,
      solicitacoes: lista.map((s) => ({
        id: s.id,
        nome: s.nome,
        email: s.email,
        cpf: s.cpf ? mascararCpf(s.cpf) : "",
        matricula: s.matricula || "",
        curso: s.curso || "",
        origem: s.origem || (s.cpf ? "checkin" : "monitores"),
        status: s.status,
        criado_em: s.created_date,
        decidido_por: s.decidido_por || "",
        decidido_em: s.decidido_em || "",
      })),
    };
  });

// Aprova (vira Monitor de Frequência) ou recusa um pedido.
export const decidirSolicitacaoCheckin = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (perfil !== "administrador") return { ok: false, erro: "Apenas administradores aprovam o acesso ao check-in." };
    if (!data?.id) return { ok: false, erro: "Pedido inválido." };

    let s = null;
    try {
      s = await base44.entities.SolicitacaoCheckin.get(data.id);
    } catch {
      s = null;
    }
    if (!s) return { ok: false, erro: "Pedido não encontrado." };

    const aprovar = data.aprovar === true;
    if (aprovar) {
      const email = String(s.email).toLowerCase();
      const membros = await todos(base44.entities.Equipe.filter({ email }));
      const existente = membros[0];
      if (!existente) {
        await base44.entities.Equipe.create({ nome: s.nome, email, perfil: "monitor", ativo: true });
      } else if (existente.ativo === false) {
        // Reativa sem rebaixar quem já tinha um perfil maior (professor, suporte...).
        await base44.entities.Equipe.update(existente.id, { ativo: true });
      }
    }

    await base44.entities.SolicitacaoCheckin.update(s.id, {
      status: aprovar ? "aprovada" : "recusada",
      decidido_por: String(context.user?.email || ""),
      decidido_em: new Date().toISOString(),
    });
    return { ok: true, status: aprovar ? "aprovada" : "recusada" };
  });
