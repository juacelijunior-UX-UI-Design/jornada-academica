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
      <div className="jr-container">
        <TituloSecao id="titulo-cronograma" subtitulo="Datas oficiais do edital">
          Cronograma
        </TituloSecao>

        <div className="mt-9 grid items-start gap-8 md:grid-cols-2">
          {GRUPOS.map((g) => (
            <div key={g.titulo} className="border-l-4 border-amarelo pl-4">
              <h3 className="font-heading text-[1.15rem] font-bold text-navy">{g.titulo}</h3>
              <ol className="mt-3 space-y-2.5">
                {g.etapas.map(([data, texto, destaque]) => (
                  <li
                    key={`${data}-${texto}`}
                    className={`grid min-h-[3.25rem] grid-cols-1 items-center gap-x-3 gap-y-0.5 sm:grid-cols-[9.5rem_1fr] rounded-lg bg-white px-4 py-3 shadow-[0_2px_12px_rgba(1,28,99,0.08)] ${
                      destaque ? "border-l-4 border-vermelho" : ""
                    }`}
                  >
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
