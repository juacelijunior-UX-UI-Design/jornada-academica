import { CalendarDays } from "lucide-react";

const DIAS = [
  {
    titulo: "09/12/2026, 1º dia",
    itens: [
      ["8h30", "Cerimônia de abertura"],
      ["9h às 12h", "Apresentações de trabalhos"],
      ["18h30 às 21h30", "Apresentações de trabalhos"],
    ],
  },
  {
    titulo: "10/12/2026, 2º dia",
    itens: [
      ["8h30 às 12h", "Apresentações de trabalhos"],
      ["18h às 20h", "Apresentações de trabalhos"],
      ["20h30", "Encerramento e premiação dos trabalhos"],
    ],
  },
];

export default function Programacao() {
  return (
    <section id="programacao" aria-labelledby="titulo-programacao" className="jr-container pb-10 lg:pb-14">
      <h2 id="titulo-programacao" className="jr-titulo-bloco filete">
        Programação
      </h2>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {DIAS.map((dia) => (
          <article key={dia.titulo} className="jr-card h-full p-6">
            <h3 className="flex items-center gap-2 font-heading text-[1.15rem] font-bold text-navy">
              <CalendarDays className="h-5 w-5 text-royal" aria-hidden="true" />
              {dia.titulo}
            </h3>
            <ul className="mt-4 divide-y divide-linea">
              {dia.itens.map(([hora, texto]) => (
                <li key={hora} className="flex flex-wrap items-baseline gap-x-3 py-2.5">
                  <strong className="min-w-[6.5rem] font-heading text-[0.95rem] text-royal">{hora}</strong>
                  <span className="text-tinta">{texto}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}