import { Mic, Presentation } from "lucide-react";
import TituloSecao from "@/components/landing/TituloSecao";
import { BANNER_DIMENSOES } from "@/lib/evento";

const FORMATOS = [
  {
    Icone: Presentation,
    titulo: "Banner",
    regra: "Obrigatório para APIExt I, III e V.",
    itens: [
      "Apresentação de 10 minutos, avaliada por pelo menos um professor ou profissional da área.",
      <>
        Dimensões do banner: <strong className="font-bold">{BANNER_DIMENSOES}</strong>.
      </>,
      <>
        Posicione o banner 30 minutos antes do turno: <strong className="font-bold">manhã até 8h</strong> e{" "}
        <strong className="font-bold">noite até 18h</strong>.
      </>,
      "Use o modelo de banner disponível na página de inscrição.",
    ],
  },
  {
    Icone: Mic,
    titulo: "Comunicação oral",
    regra: "Obrigatória para APIExt II, IV e VI.",
    itens: [
      "Apresentação de 10 minutos, avaliada por pelo menos um professor ou profissional da área.",
      "Entregue o material 10 minutos antes da sessão.",
      "Leve o próprio computador com saída HDMI.",
    ],
  },
];

export default function Formatos() {
  return (
    <section id="formatos" aria-labelledby="titulo-formatos" className="bg-white py-14 lg:py-16">
      <div className="jr-container-amplo">
        <TituloSecao id="titulo-formatos">Formatos de apresentação</TituloSecao>

        <div className="mt-9 grid auto-rows-fr gap-5 md:grid-cols-2">
          {FORMATOS.map((f) => (
            <article
              key={f.titulo}
              className="rounded-2xl border border-linea border-t-[5px] border-t-amarelo bg-white p-6 shadow-[0_8px_24px_rgba(1,28,99,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(1,28,99,0.14)] lg:p-7"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-[#e8eefc] text-navy">
                  <f.Icone className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-heading text-[1.2rem] font-bold text-navy">{f.titulo}</h3>
                  <p className="text-[0.95rem] font-semibold text-royal">{f.regra}</p>
                </div>
              </div>
              <ul className="mt-4 list-disc marker:text-amarelo space-y-1.5 pl-5 text-[0.95rem] leading-snug text-tinta [hyphens:auto] text-justify">
                {f.itens.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="mt-6 text-center text-[0.95rem] text-tinta-suave">
          PIC, outras disciplinas e trabalhos externos escolhem o formato na inscrição.
        </p>
      </div>
    </section>
  );
}
