import { createServerFn } from "@tanstack/react-start";
import { requireUser } from "@/lib/auth-middleware";
import { apenasDigitos, mascararCpf } from "@/lib/validacao";
import {
  calcularResumo,
  descreverRegra,
  todos,
} from "@/lib/jornada.server";

// Painel de chamada: sessões, participantes (sem dados sensíveis) e quem já está presente.
export const carregarChamada = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44().asServiceRole;
    const [{ alunos, configuracao, carga_horaria_total }, sessoes, presencas] = await Promise.all([
      calcularResumo(base44),
      todos(base44.entities.Sessao.list("data")),
      todos(base44.entities.Presenca.list("-created_date")),
    ]);

    return {
      usuario: { nome: context.user.full_name, email: context.user.email },
      sessoes: sessoes.map((s) => ({
        id: s.id,
        titulo: s.titulo,
        data: s.data,
        hora_inicio: s.hora_inicio,
        hora_fim: s.hora_fim,
        carga_horaria: Number(s.carga_horaria || 0),
      })),
      participantes: alunos.map((a) => ({
        id: a.id,
        nome: a.nome,
        matricula: a.matricula,
        curso: a.curso,
        cpf: mascararCpf(a.cpf),
        presencas: a.presencas,
        percentual: a.percentual,
        elegivel: a.elegivel,
      })),
      presencas: presencas.map((p) => ({ participante_id: p.participante_id, sessao_id: p.sessao_id })),
      regra: descreverRegra(configuracao),
      carga_horaria_total,
      total_elegiveis: alunos.filter((a) => a.elegivel).length,
    };
  });

// Registra a presença de um ou vários participantes em uma sessão (nunca duplica).
export const registrarPresencas = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const sessaoId = String(data.sessao_id || "");
    const ids = Array.isArray(data.participante_ids) ? data.participante_ids.filter(Boolean) : [];
    if (!sessaoId || !ids.length) return { ok: false, erro: "Selecione a sessão e os participantes." };

    const [sessoes, presencas] = await Promise.all([
      todos(base44.entities.Sessao.list("data")),
      todos(base44.entities.Presenca.filter({ sessao_id: sessaoId })),
    ]);
    if (!sessoes.some((s) => s.id === sessaoId)) {
      return { ok: false, erro: "Sessão não encontrada." };
    }

    const jaPresentes = new Set(presencas.map((p) => p.participante_id));
    const novos = ids.filter((id) => !jaPresentes.has(id));

    if (novos.length) {
      await base44.entities.Presenca.bulkCreate(
        novos.map((id) => ({
          participante_id: id,
          sessao_id: sessaoId,
          registrado_por: context.user.full_name || context.user.email,
          registrado_por_email: context.user.email,
        }))
      );
    }

    return {
      ok: true,
      registradas: novos.length,
      ja_registradas: ids.length - novos.length,
      presentes: [...jaPresentes, ...novos],
    };
  });

// Busca por CPF na chamada (o painel recebe o CPF mascarado, então a busca é no servidor).
export const buscarPorCpf = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const cpf = apenasDigitos(data?.cpf);
    if (cpf.length < 3) return [];
    const base44 = context.getBase44().asServiceRole;
    const encontrados = await todos(
      base44.entities.Participante.filter(cpf.length === 11 ? { cpf } : { cpf: { $regex: cpf } })
    );
    return encontrados.map((p) => p.id);
  });