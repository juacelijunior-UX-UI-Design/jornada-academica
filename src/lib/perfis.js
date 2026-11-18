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

export const SECOES_PAINEL = [
  { id: "visao", titulo: "Visão geral", to: "/painel", perfis: PERFIS_GESTAO },
  { id: "usuarios", titulo: "Usuários e perfis", to: "/painel/usuarios", perfis: ["administrador"] },
  { id: "inscricoes", titulo: "Inscrições", to: "/painel/inscricoes", perfis: PERFIS_INSCRICAO },
  { id: "chamada", titulo: "Chamada", to: "/painel/chamada", perfis: PERFIS_CHAMADA },
  { id: "checkin", titulo: "Check-in por QR", to: "/painel/checkin", perfis: PERFIS_CHAMADA },
  { id: "configuracoes", titulo: "Configurações e certificados", to: "/painel/configuracoes", perfis: PERFIS_CONFIG },
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