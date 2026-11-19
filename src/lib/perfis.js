// Perfis do painel: um só lugar define quem vê o quê (cliente e servidor).
export const PERFIS = {
  administrador: "Administrador",
  suporte: "Suporte",
  professor: "Professor",
  monitor: "Monitor de Frequência",
  aluno: "Aluno",
  participante: "Participante",
  visitante: "Sem perfil",
};

export const PERFIS_EQUIPE = ["administrador", "suporte", "professor", "monitor"];
// Equipe sem o Monitor de Frequência (o monitor só vê Chamada e Check-in).
export const PERFIS_GESTAO = ["administrador", "suporte", "professor"];
export const PERFIS_INSCRICAO = ["administrador", "suporte", "professor"];
export const PERFIS_CHAMADA = ["administrador", "suporte", "professor", "monitor"];
export const PERFIS_CONFIG = ["administrador", "suporte"];

// A ordem aqui é a ordem do menu; `grupo` separa o menu em blocos.
export const GRUPOS_PAINEL = { inicio: "Início", evento: "Evento", admin: "Administração" };

export const SECOES_PAINEL = [
  {
    id: "visao",
    titulo: "Visão geral",
    to: "/painel",
    grupo: "inicio",
    perfis: PERFIS_GESTAO,
    resumo: "Números do evento, pendências e atalhos.",
  },
  {
    id: "inscricoes",
    titulo: "Inscrições",
    to: "/painel/inscricoes",
    grupo: "evento",
    perfis: PERFIS_INSCRICAO,
    resumo: "Submissões, trabalhos, apresentações e participantes.",
  },
  {
    id: "checkin",
    titulo: "Check-in por QR",
    to: "/painel/checkin",
    grupo: "evento",
    perfis: PERFIS_CHAMADA,
    resumo: "Leia o QR Code do ingresso e registre a presença.",
  },
  {
    id: "chamada",
    titulo: "Chamada",
    to: "/painel/chamada",
    grupo: "evento",
    perfis: PERFIS_CHAMADA,
    resumo: "Marque a presença por atividade, pela lista de nomes.",
  },
  {
    id: "configuracoes",
    titulo: "Configurações e certificados",
    to: "/painel/configuracoes",
    grupo: "admin",
    perfis: PERFIS_CONFIG,
    resumo: "Regra de aprovação, datas, assinaturas e emissão.",
  },
  {
    id: "usuarios",
    titulo: "Usuários e perfis",
    to: "/painel/usuarios",
    grupo: "admin",
    perfis: ["administrador"],
    resumo: "Pedidos de check-in, equipe e contas do site.",
  },
];

export const podeAcessar = (perfil, secao) => {
  const s = SECOES_PAINEL.find((x) => x.id === secao);
  return Boolean(s && perfil && s.perfis.includes(perfil));
};

export const ehEquipe = (perfil) => PERFIS_EQUIPE.includes(perfil);

// Seção do painel de um endereço (/painel/inscricoes -> "inscricoes").
export function secaoDaRota(caminho) {
  const limpo = String(caminho || "").replace(/\/+$/, "");
  const achada = [...SECOES_PAINEL]
    .sort((a, b) => b.to.length - a.to.length)
    .find((s) => limpo === s.to || limpo.startsWith(`${s.to}/`));
  return achada?.id ?? null;
}

// Primeira seção liberada para o perfil (para onde ele vai ao abrir o painel).
export const primeiraSecao = (perfil) => SECOES_PAINEL.find((s) => podeAcessar(perfil, s.id)) ?? null;