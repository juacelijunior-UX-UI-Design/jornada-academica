import TituloSecao from "@/components/landing/TituloSecao";

const DIAS = [
  {
    titulo: "1º dia · Quarta, 09/12/2026",
    itens: [
      ["8h30", "Cerimônia de abertura"],
      ["9h às 12h", "Apresentações de trabalhos"],
      ["18h30 às 21h30", "Apresentações de trabalhos"],
    ],
  },
  {
    titulo: "2º dia · Quinta, 10/12/2026",
    itens: [
      ["8h30 às 12h", "Apresentações de trabalhos"],
      ["18h às 20h", "Apresentações de trabalhos"],
      ["20h30", "Encerramento e premiação dos trabalhos"],
    ],
  },
];

export default function Programacao() {
  return (
    <section id="programacao" aria-labelledby="titulo-programacao" className="bg-white py-14 lg:py-16">
      <div className="jr-container">
        <TituloSecao
          id="titulo-programacao"
          subtitulo="Dia e horário de cada apresentação divulgados em 05/12/2026 · UNINASSAU Teresina"
        >
          Programação
        </TituloSecao>

        <div className="mt-9 grid gap-8 md:grid-cols-2">
          {DIAS.map((dia) => (
            <div key={dia.titulo} className="border-l-4 border-amarelo pl-4">
              <h3 className="font-heading text-[1.15rem] font-bold text-navy">{dia.titulo}</h3>
              <ul className="mt-3 space-y-2.5">
                {dia.itens.map(([hora, texto]) => (
                  <li
                    key={hora}
                    className="grid min-h-[3.25rem] grid-cols-[8.5rem_1fr] items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-[0_2px_12px_rgba(1,28,99,0.08)]"
                  >
                    <strong className="font-heading text-[0.95rem] font-bold text-navy">{hora}</strong>
                    <span className="font-semibold text-tinta">{texto}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
