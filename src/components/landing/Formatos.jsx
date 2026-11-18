import TituloSecao from "@/components/landing/TituloSecao";

const FORMATOS = [
  {
    titulo: "Banner",
    regra: "Obrigatório para APIExt I, III e V.",
    itens: [
      "Apresentação de 10 minutos, avaliada por pelo menos um professor ou profissional da área.",
      <>
        Posicione o banner 30 minutos antes do turno: <strong className="font-bold">manhã até 8h</strong> e{" "}
        <strong className="font-bold">noite até 18h</strong>.
      </>,
      "Use o modelo de banner disponível na página de inscrição.",
    ],
  },
  {
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
      <div className="jr-container">
        <TituloSecao id="titulo-formatos">Formatos de apresentação</TituloSecao>

        <div className="mt-9 grid auto-rows-fr gap-5 md:grid-cols-2">
          {FORMATOS.map((f) => (
            <article
              key={f.titulo}
              className="rounded-xl border border-linea bg-white p-6 shadow-[0_8px_24px_rgba(1,28,99,0.08)]"
            >
              <h3 className="font-heading text-[1.2rem] font-bold text-navy">{f.titulo}</h3>
              <p className="mt-1 text-[0.95rem] text-tinta-suave">{f.regra}</p>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.95rem] leading-snug text-tinta">
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
