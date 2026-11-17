import { createFileRoute } from "@tanstack/react-router";
import UsuariosPainel from "@/components/painel/UsuariosPainel";

export const Route = createFileRoute("/_authed/painel/usuarios")({
  head: () => ({ meta: [{ title: "Usuários e perfis | Painel da Jornada" }] }),
  component: UsuariosPage,
});

function UsuariosPage() {
  return (
    <>
      <h1 className="font-heading text-[clamp(1.3rem,4vw,1.8rem)] font-extrabold text-navy">Usuários e perfis</h1>
      <p className="mb-5 mt-1 text-tinta-suave">
        Convide pessoas, crie contas e defina o que cada perfil pode fazer no painel.
      </p>
      <UsuariosPainel />
    </>
  );
}