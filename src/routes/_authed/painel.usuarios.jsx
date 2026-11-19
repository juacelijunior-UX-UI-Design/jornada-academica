import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import PainelCabecalho from "@/components/painel/PainelCabecalho";
import UsuariosPainel from "@/components/painel/UsuariosPainel";

export const Route = createFileRoute("/_authed/painel/usuarios")({
  head: () => ({ meta: [{ title: "Usuários e perfis | Painel da Jornada" }] }),
  component: UsuariosPage,
});

function UsuariosPage() {
  return (
    <>
      <PainelCabecalho
        Icone={Users}
        titulo="Usuários e perfis"
        descricao="Aprove pedidos de check-in, convide pessoas para a equipe e defina o que cada perfil pode fazer."
      />
      <UsuariosPainel />
    </>
  );
}