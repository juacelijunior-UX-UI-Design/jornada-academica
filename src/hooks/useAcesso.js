import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/lib/AuthContext";
import { meuAcesso } from "@/lib/fn-equipe";
import { ehEquipe } from "@/lib/perfis";

// Perfil do usuário logado, para montar os links do site e do painel.
export function useAcesso() {
  const { user, isLoadingAuth } = useAuth();
  const buscar = useServerFn(meuAcesso);
  const { data } = useQuery({
    queryKey: ["acesso"],
    queryFn: () => buscar(),
    enabled: !isLoadingAuth && Boolean(user),
    staleTime: 60_000,
  });
  const perfil = data?.perfil ?? null;
  return { perfil, daEquipe: ehEquipe(perfil), carregando: !isLoadingAuth && Boolean(user) && !data };
}