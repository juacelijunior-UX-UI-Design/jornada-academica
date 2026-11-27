import TituloSecao from "@/components/landing/TituloSecao";

const GRUPOS = [
  {
    titulo: "Antes do evento",
    etapas: [
      ["13/11/2026", "Lançamento do edital"],
      ["16 a 30/11/2026", "Período de inscrições"],
      ["05/12/2026", "Divulgação dos trabalhos selecionados"],
      ["05/12/2026", "Definição de dia e horário da apresentação"],
    ],
  },
  {
    titulo: "Evento e certificados",
    etapas: [
      ["09 e 10/12/2026", "VI Jornada Acadêmica", true],
      ["A partir de 14/12/2026", "Certificados disponíveis no site"],
    ],
  },
];

export default function Cronograma() {
  return (
    <section id="cronograma" aria-labelledby="titulo-cronograma" className="py-14 lg:py-16">
      <div className="jr-container-amplo">
        <TituloSecao id="titulo-cronograma" subtitulo="Datas oficiais do edital">
          Cronograma
        </TituloSecao>

        <div className="mt-9 grid items-start gap-8 md:grid-cols-2">
          {GRUPOS.map((g) => (
            <div key={g.titulo} className="rounded-2xl bg-white p-5 shadow-[0_8px_24px_rgba(1,28,99,0.08)] sm:p-6">
              <h3 className="font-heading text-[1.15rem] font-bold text-navy">{g.titulo}</h3>
              <ol className="relative mt-4 space-y-3 pl-7 before:absolute before:bottom-3 before:left-[7px] before:top-3 before:w-0.5 before:bg-[#d6def3]">
                {g.etapas.map(([data, texto, destaque]) => (
                  <li
                    key={`${data}-${texto}`}
                    className={`relative grid min-h-[3.25rem] grid-cols-1 items-center gap-x-3 gap-y-0.5 sm:grid-cols-[10rem_1fr] rounded-xl px-4 py-3 ${
                      destaque ? "bg-[#fdecee]" : "bg-[#f3f6fd]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute -left-7 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_0_0_2px_currentColor] ${
                        destaque ? "bg-vermelho text-vermelho" : "bg-amarelo text-amarelo"
                      }`}
                    />
                    <strong
                      className={`font-heading text-[0.95rem] font-bold ${destaque ? "text-vermelho-texto" : "text-navy"}`}
                    >
                      {data}
                    </strong>
                    <span className="font-semibold text-tinta">{texto}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
