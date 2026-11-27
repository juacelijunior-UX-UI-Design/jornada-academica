import { RESUMO_MAX } from "@/lib/evento";

const PASSOS = [
  {
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
    titulo: "Confira a seleção",
    texto: (
      <>
        Em <strong className="font-bold text-tinta">05/12</strong>, saem os trabalhos selecionados e o dia
        e horário da apresentação, nas redes sociais do evento.
      </>
    ),
  },
  {
    titulo: "Apresente no evento",
    texto: (
      <>
        Apresente em <strong className="font-bold text-tinta">09 ou 10/12</strong>, mostre o seu QR Code e
        contribua com 1 kg de alimento não perecível no credenciamento.
      </>
    ),
  },
  {
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
      <div className="bg-navy py-7">
        <h2
          id="titulo-como-participar"
          className="jr-container text-center font-heading text-[clamp(1.6rem,4.5vw,2.25rem)] font-extrabold text-white"
        >
          Como participar?
        </h2>
      </div>

      <div className="jr-container pt-10 lg:max-w-[1360px]">
        <ol className="m-0 grid auto-rows-fr list-none gap-5 p-0 sm:grid-cols-2 xl:grid-cols-4">
          {PASSOS.map(({ titulo, texto }, i) => (
            <li
              key={titulo}
              className="rounded-xl border-t-[5px] border-amarelo bg-white p-6 shadow-[0_8px_24px_rgba(1,28,99,0.10)]"
            >
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-navy font-heading text-[1.05rem] font-extrabold text-amarelo"
              >
                {i + 1}
              </span>
              <h3 className="mt-4 font-heading text-[1.15rem] font-bold text-tinta">{titulo}</h3>
              <p className="mt-2 text-[1rem] leading-relaxed text-tinta">{texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
