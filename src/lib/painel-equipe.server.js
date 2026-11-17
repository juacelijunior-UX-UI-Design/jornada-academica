// Resolve o perfil do usuário logado. A lista de perfis (Equipe) só é escrita por administradores.
import { todos } from "@/lib/jornada.server";
import { participantePorEmail } from "@/lib/ingresso.server";

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function resolverPerfil(base44, user) {
  if (!user?.email) return "visitante";
  if (user.role === "admin") return "administrador";

  const email = String(user.email).toLowerCase();
  const membros = await todos(base44.entities.Equipe.filter({ email }));
  const ativo = membros.find((m) => m.ativo !== false);
  if (ativo?.perfil) return ativo.perfil;

  const p = await participantePorEmail(base44, email);
  if (p) return p.tipo === "aluno" ? "aluno" : "participante";
  return "visitante";
}

export async function acessoDe(base44, user) {
  const perfil = await resolverPerfil(base44, user);
  return { perfil, nome: user.full_name || "", email: user.email };
}

export const permitido = (perfil, lista) => Boolean(perfil) && lista.includes(perfil);

export function exigirPerfil(perfil, lista) {
  if (!permitido(perfil, lista)) {
    throw Object.assign(new Error("Seu perfil não tem acesso a este recurso."), { status: 403 });
  }
}