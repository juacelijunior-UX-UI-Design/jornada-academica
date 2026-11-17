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
export const PERFIS_INSCRICAO = ["administrador", "suporte", "professor"];
export const PERFIS_CHAMADA = ["administrador", "suporte", "professor", "monitor"];
export const PERFIS_CONFIG = ["administrador", "suporte"];

export const SECOES_PAINEL = [
  { id: "visao", titulo: "Visão geral", to: "/painel", perfis: PERFIS_EQUIPE },
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