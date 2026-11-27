import { Award, FileUp, Presentation, SearchCheck } from "lucide-react";
import { RESUMO_MAX } from "@/lib/evento";

const PASSOS = [
  {
    Icone: FileUp,
    titulo: "Inscreva o trabalho",
    texto: (
      <>
        De <strong className="font-bold text-tinta">16 a 30/11</strong>, envie o resumo (até{" "}
        {RESUMO_MAX.toLocaleString("pt-BR")} caracteres), o arquivo e os dados do apresentador e dos
        co-autores.
      </>
    ),
  },
  {
    Icone: SearchCheck,
    titulo: "Confira a seleção",
    texto: (
      <>
        Em <strong className="font-bold text-tinta">05/12</strong>, saem os trabalhos selecionados e o dia
        e horário da apresentação, nas redes sociais do evento.
      </>
    ),
  },
  {
    Icone: Presentation,
    titulo: "Apresente no evento",
    texto: (
      <>
        Apresente em <strong className="font-bold text-tinta">09 ou 10/12</strong>, mostre o seu QR Code e
        contribua com 1 kg de alimento não perecível no credenciamento.
      </>
    ),
  },
  {
    Icone: Award,
    titulo: "Receba o certificado",
    texto: (
      <>
        A partir de <strong className="font-bold text-tinta">14/12</strong>, após a validação da
        participação, consulte o seu certificado no site.
      </>
    ),
  },
];

export default function ComoParticipar() {
  return (
    <section id="como-participar" aria-labelledby="titulo-como-participar" className="pb-14 lg:pb-16">
      <div className="relative overflow-hidden bg-navy bg-[radial-gradient(60%_140%_at_50%_0%,rgba(0,64,206,0.55)_0%,rgba(1,28,99,0)_70%)] py-8">
        <h2
          id="titulo-como-participar"
          className="jr-container text-center font-heading text-[clamp(1.6rem,4.5vw,2.25rem)] font-extrabold text-white"
        >
          Como participar?
        </h2>
      </div>

      <div className="jr-container-amplo pt-10">
        <ol className="m-0 grid auto-rows-fr list-none gap-5 p-0 sm:grid-cols-2 xl:grid-cols-4">
          {PASSOS.map(({ Icone, titulo, texto }, i) => (
            <li
              key={titulo}
              className="group relative overflow-hidden rounded-2xl border-t-[5px] border-amarelo bg-white p-6 shadow-[0_8px_24px_rgba(1,28,99,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(1,28,99,0.16)]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 -top-2 font-heading text-[5.5rem] font-extrabold leading-none text-[#e8eefc] transition-colors duration-300 group-hover:text-[#dde6fb]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-amarelo shadow-[0_6px_14px_rgba(1,28,99,0.25)]">
                <Icone className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="relative mt-4 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-royal">Passo {i + 1}</p>
              <h3 className="relative mt-1 font-heading text-[1.15rem] font-bold text-navy">{titulo}</h3>
              <p className="relative mt-2 text-[1rem] leading-relaxed text-tinta [hyphens:auto] text-justify">{texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
