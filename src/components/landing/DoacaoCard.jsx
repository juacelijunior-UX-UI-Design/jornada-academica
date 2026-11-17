import { ShoppingBasket } from "lucide-react";

export default function DoacaoCard() {
  return (
    <section aria-labelledby="titulo-doacao" className="jr-container py-10 lg:py-14">
      <div className="jr-card flex items-start gap-5 border-t-4 border-amarelo p-6 lg:p-8">
        <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-fundo">
          <ShoppingBasket className="h-7 w-7 text-royal" aria-hidden="true" />
        </span>
        <div>
          <h2 id="titulo-doacao" className="font-heading text-[1.35rem] font-extrabold text-navy">
            Doação de 1 kg de alimento não perecível
          </h2>
          <p className="mt-2 text-[1.0625rem] leading-relaxed text-tinta">
            Cada aluno participante é convidado a contribuir. O alimento é recebido no
            credenciamento e doado a uma instituição de trabalho social reconhecida.
          </p>
        </div>
      </div>
    </section>
  );
}