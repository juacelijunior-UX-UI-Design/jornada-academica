import { createFileRoute } from "@tanstack/react-router";
import { Ticket } from "lucide-react";
import PainelShell from "@/components/painel/PainelShell";
import PainelCabecalho from "@/components/painel/PainelCabecalho";
import IngressoCard from "@/components/ingresso/IngressoCard";
import DadosInscricao from "@/components/ingresso/DadosInscricao";
import Botao from "@/components/site/Botao";
import { meuIngresso } from "@/lib/fn-ingresso";

export const Route = createFileRoute("/_authed/minha-inscricao")({
  loader: () => meuIngresso(),
  head: () => ({ meta: [{ title: "Minha inscrição | VI Jornada Acadêmica" }] }),
  component: MinhaInscricaoPage,
});

function MinhaInscricaoPage() {
  const dados = Route.useLoaderData();

  return (
    <PainelShell>
      <PainelCabecalho
        Icone={Ticket}
        titulo="Minha inscrição"
        descricao="Seus dados de inscrição e o QR Code de identificação para registrar presença no evento."
      />

      {dados.encontrado ? (
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_380px]">
          <DadosInscricao inscricao={dados.inscricao} />
          <IngressoCard ingresso={dados.inscricao} />
        </div>
      ) : (
        <div className="jr-card mx-auto max-w-lg p-6">
          <p className="mb-3">
            Não encontramos uma inscrição com o e-mail <strong>{dados.email}</strong>. Entre com o mesmo
            e-mail usado na inscrição do trabalho ou faça a sua inscrição.
          </p>
          <Botao to="/inscricao" variante="cta">Inscrever meu trabalho</Botao>
        </div>
      )}
    </PainelShell>
  );
}