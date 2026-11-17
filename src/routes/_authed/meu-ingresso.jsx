import { createFileRoute } from "@tanstack/react-router";
import PainelShell from "@/components/painel/PainelShell";
import IngressoCard from "@/components/ingresso/IngressoCard";
import Botao from "@/components/site/Botao";
import { meuIngresso } from "@/lib/fn-ingresso";

export const Route = createFileRoute("/_authed/meu-ingresso")({
  loader: () => meuIngresso(),
  head: () => ({ meta: [{ title: "Meu ingresso | VI Jornada Acadêmica" }] }),
  component: MeuIngressoPage,
});

function MeuIngressoPage() {
  const ingresso = Route.useLoaderData();

  return (
    <PainelShell>
      <h1 className="font-heading text-[clamp(1.5rem,4vw,2rem)] font-extrabold text-navy">Meu ingresso</h1>
      <p className="mb-6 mt-1 text-tinta-suave">
        Seu QR Code de identificação para registrar presença nos dias do evento.
      </p>

      {ingresso.encontrado ? (
        <IngressoCard ingresso={ingresso} />
      ) : (
        <div className="jr-card mx-auto max-w-lg p-6">
          <p className="mb-3">
            Não encontramos uma inscrição com o e-mail <strong>{ingresso.email}</strong>. Entre com o
            mesmo e-mail usado na inscrição do trabalho ou faça a sua inscrição.
          </p>
          <Botao to="/inscricao" variante="cta">
            Inscrever meu trabalho
          </Botao>
        </div>
      )}
    </PainelShell>
  );
}