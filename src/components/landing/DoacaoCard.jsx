import { ShoppingBasket } from "lucide-react";

export default function DoacaoCard() {
  return (
    <section id="doacao" aria-labelledby="titulo-doacao" className="py-12 lg:py-14">
      <div className="jr-container-amplo">
        <div className="flex flex-col items-start gap-4 rounded-xl border border-[#f3d27a] bg-[#fff6d9] p-6 sm:flex-row sm:items-center sm:gap-5 lg:p-8">
          <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-amarelo">
            <ShoppingBasket className="h-8 w-8 text-navy" aria-hidden="true" />
          </span>
          <div>
            <h2 id="titulo-doacao" className="font-heading text-[1.4rem] font-extrabold text-navy">
              Doação de 1 kg de alimento não perecível
            </h2>
            <p className="mt-1 text-[1.0625rem] leading-relaxed text-tinta">
              Cada aluno participante é convidado a contribuir com{" "}
              <strong className="font-bold">1 kg de alimento não perecível</strong>. O alimento é recebido no
              credenciamento e doado a uma instituição de trabalho social reconhecida.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
