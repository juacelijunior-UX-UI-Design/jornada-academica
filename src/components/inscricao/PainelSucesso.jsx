import { CheckCircle2, ShoppingBasket } from "lucide-react";
import Botao from "@/components/site/Botao";
import { EVENTO, FORMATOS } from "@/lib/evento";

export default function PainelSucesso({ resultado, onNova }) {
  const recebidos = [
    resultado.tem_resumo ? "o resumo" : "",
    resultado.tem_arquivo ? "o arquivo" : "",
  ].filter(Boolean);

  return (
    <div>
      <div className="jr-alerta jr-alerta-sucesso mb-4" role="status">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <span>Inscrição confirmada, {String(resultado.nome).split(" ")[0]}!</span>
      </div>

      {recebidos.length > 0 && (
        <p className="mb-3">
          Recebemos {recebidos.join(" e ")}.
        </p>
      )}

      {FORMATOS[resultado.formato] && (
        <p className="mb-4">
          Formato de apresentação: <strong>{FORMATOS[resultado.formato]}</strong>
        </p>
      )}

      <div className="jr-alerta jr-alerta-info mb-4">
        <ShoppingBasket className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <span>
          Leve <strong>1 kg de alimento não perecível</strong>. Ele será recebido no
          credenciamento e doado a uma instituição de trabalho social.
        </span>
      </div>

      <p className="mb-5">
        A Jornada acontece em <strong>{EVENTO.datas}</strong>. Os dias e horários das
        apresentações serão divulgados em 05/12/2026, nas redes sociais do evento.
      </p>

      <div className="flex flex-wrap gap-3">
        <Botao to="/">Voltar ao início</Botao>
        <Botao variante="contorno" onClick={onNova}>
          Nova inscrição
        </Botao>
      </div>
    </div>
  );
}