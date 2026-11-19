import { createServerFn } from "@tanstack/react-start";
import { requireUser } from "@/lib/auth-middleware";
import { acessoDe, permitido } from "@/lib/painel-equipe.server";
import { PERFIS_CONFIG } from "@/lib/perfis";
import { DATA_LIBERACAO_CERTIFICADOS } from "@/lib/evento";
import {
  CONFIGURACAO_PADRAO,
  calcularResumo,
  certificadosLiberados,
  dataLiberacaoCertificados,
  descreverRegra,
  formatarDataBr,
  obterConfiguracao,
  salvarConfiguracao,
  todos,
} from "@/lib/jornada.server";

import { novoCodigo } from "@/lib/certificado.server";

const DATA = /^\d{4}-\d{2}-\d{2}$/;
const NEGADO = { ok: false, erro: "Acesso restrito à administração e ao suporte." };

export const carregarAdmin = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (!permitido(perfil, PERFIS_CONFIG)) return NEGADO;
    const [{ alunos, configuracao, carga_horaria_total }, certificados] = await Promise.all([
      calcularResumo(base44),
      todos(base44.entities.Certificado.list("-created_date")),
    ]);
    return {
      ok: true,
      usuario: { nome: context.user.full_name, email: context.user.email },
      configuracao,
      regra: descreverRegra(configuracao),
      total_inscritos: alunos.length,
      total_elegiveis: alunos.filter((a) => a.elegivel).length,
      // Aptos por carga horária: 20 h (apresentou o trabalho) e 4 h (participante ou não apresentou).
      aptos_20h: alunos.filter((a) => a.elegivel && a.horas_certificado === 20).length,
      aptos_4h: alunos.filter((a) => a.elegivel && a.horas_certificado !== 20).length,
      total_certificados: certificados.length,
      carga_horaria_total,
      liberado: certificadosLiberados(configuracao),
      liberacao: formatarDataBr(dataLiberacaoCertificados(configuracao)),
    };
  });

export const salvarConfiguracoes = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (!permitido(perfil, PERFIS_CONFIG)) return NEGADO;

    const modo = ["presenca", "horas", "percentual"].includes(data.modo_aprovacao)
      ? data.modo_aprovacao
      : "presenca";
    const minimo = modo === "presenca" ? 1 : Number(data.valor_minimo);
    const erros = {};
    if (modo !== "presenca") {
      if (!Number.isFinite(minimo) || minimo < 0) erros.valor_minimo = "Informe um valor válido.";
      else if (modo === "percentual" && minimo > 100) erros.valor_minimo = "O percentual vai de 0 a 100.";
    }

    for (const campo of ["inscricoes_de", "inscricoes_ate", "certificados_a_partir_de"]) {
      if (data[campo] && !DATA.test(data[campo])) erros[campo] = "Data inválida.";
    }
    if (
      !erros.certificados_a_partir_de &&
      data.certificados_a_partir_de &&
      data.certificados_a_partir_de < DATA_LIBERACAO_CERTIFICADOS
    ) {
      erros.certificados_a_partir_de = `Os certificados não podem ser liberados antes de ${formatarDataBr(DATA_LIBERACAO_CERTIFICADOS)}.`;
    }
    if (!erros.inscricoes_de && !erros.inscricoes_ate && data.inscricoes_de > data.inscricoes_ate) {
      erros.inscricoes_ate = "O fim das inscrições deve ser depois do início.";
    }
    if (Object.keys(erros).length) return { ok: false, erros };

    const configuracao = await salvarConfiguracao(base44, {
      modo_aprovacao: modo,
      valor_minimo: minimo,
      inscricoes_de: data.inscricoes_de || CONFIGURACAO_PADRAO.inscricoes_de,
      inscricoes_ate: data.inscricoes_ate || CONFIGURACAO_PADRAO.inscricoes_ate,
      certificados_a_partir_de:
        data.certificados_a_partir_de || CONFIGURACAO_PADRAO.certificados_a_partir_de,
      ignorar_datas: Boolean(data.ignorar_datas),
      reitora_nome: String(data.reitora_nome || "").trim().slice(0, 150),
      coordenador_nome: String(data.coordenador_nome || "").trim().slice(0, 150),
    });

    return { ok: true, configuracao, regra: descreverRegra(configuracao) };
  });

export const emitirCertificados = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44().asServiceRole;
    const { perfil } = await acessoDe(base44, context.user);
    if (!permitido(perfil, PERFIS_CONFIG)) return NEGADO;
    const configuracao = await obterConfiguracao(base44);

    if (!certificadosLiberados(configuracao)) {
      return { ok: false, erro: `Os certificados só podem ser emitidos a partir de ${formatarDataBr(dataLiberacaoCertificados(configuracao))}.` };
    }

    const { alunos } = await calcularResumo(base44);
    const elegiveis = alunos.filter((a) => a.elegivel);
    const emitidos = await todos(base44.entities.Certificado.list("-created_date"));
    const jaEmitidos = new Set(emitidos.map((c) => c.participante_id));
    const pendentes = elegiveis.filter((a) => !jaEmitidos.has(a.id));

    const resumo = {
      ok: true,
      simulacao: Boolean(data?.simular),
      elegiveis: elegiveis.length,
      emitidos: pendentes.length,
      ja_emitidos: elegiveis.length - pendentes.length,
    };
    if (data?.simular || !pendentes.length) return resumo;

    await base44.entities.Certificado.bulkCreate(
      pendentes.map((a) => ({
        participante_id: a.id,
        nome: a.nome,
        horas_presentes: a.horas_presentes,
        percentual: a.percentual,
        emitido_em: new Date().toISOString(),
        codigo: novoCodigo(),
      }))
    );
    return resumo;
  });