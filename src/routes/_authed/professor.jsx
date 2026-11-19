import { createFileRoute, Navigate } from "@tanstack/react-router";

// Endereço antigo do "Painel de chamada": agora tudo fica no painel, que abre na área liberada para cada perfil
// (o professor vai direto para as Submissões).
export const Route = createFileRoute("/_authed/professor")({
  component: () => <Navigate to="/painel" replace />,
});
