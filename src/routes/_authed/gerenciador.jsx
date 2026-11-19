import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Settings } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { carregarAdmin } from "@/lib/fn-admin";
import PainelShell from "@/components/painel/PainelShell";
import PainelCabecalho from "@/components/painel/PainelCabecalho";
import ConfigFormulario from "@/components/gerenciador/ConfigFormulario";
import EmissaoCard from "@/components/gerenciador/EmissaoCard";

export const Route = createFileRoute("/_authed/gerenciador")({
  head: () => ({ meta: [{ title: "Gerenciador | VI Jornada Acadêmica" }] }),
  component: GerenciadorPage,
});

function GerenciadorPage() {
  const { user } = useAuth();
  const carregar = useServerFn(carregarAdmin);
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin"],
    queryFn: () => carregar(),
    enabled: user?.role === "admin",
  });

  const recarregar = () => queryClient.invalidateQueries({ queryKey: ["admin"] });

  if (user && user.role !== "admin") {
    return (
      <PainelShell>
        <div className="jr-alerta jr-alerta-erro" role="alert">
          Este painel é exclusivo da administração do evento.
        </div>
      </PainelShell>
    );
  }

  return (
    <PainelShell>
      <PainelCabecalho
        Icone={Settings}
        titulo="Gerenciador do evento"
        descricao="Defina a regra de aprovação, as datas e as assinaturas do certificado, e emita os certificados de quem atingiu a presença mínima."
      />

      {isLoading && (
        <p className="jr-card flex items-center gap-3 p-6 text-tinta-suave">
          <Loader2 className="h-5 w-5 animate-spin text-royal" aria-hidden="true" />
          Carregando dados do evento…
        </p>
      )}

      {isError && (
        <div className="jr-alerta jr-alerta-erro" role="alert">
          Não foi possível carregar os dados. Recarregue a página.
        </div>
      )}

      {data && !data.ok && (
        <div className="jr-alerta jr-alerta-erro" role="alert">
          {data.erro}
        </div>
      )}

      {data?.ok && (
        <div className="space-y-5">
          <div className="jr-card flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-[0.95rem]">
            <span className="font-semibold text-navy">Regra atual: {data.regra}</span>
            <span className="text-tinta-suave">
              {data.total_inscritos} inscrito(s) · {data.carga_horaria_total} h de sessões
            </span>
          </div>

          <ConfigFormulario config={data.configuracao} cargaTotal={data.carga_horaria_total} onSalvo={recarregar} />
          <EmissaoCard admin={data} onAtualizar={recarregar} />
        </div>
      )}
    </PainelShell>
  );
}