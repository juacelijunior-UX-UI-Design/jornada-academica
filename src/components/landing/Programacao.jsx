import { Clock } from "lucide-react";
import TituloSecao from "@/components/landing/TituloSecao";

const DIAS = [
  {
    rotulo: "1º dia",
    data: "Quarta, 09/12/2026",
    itens: [
      ["8h30", "Cerimônia de abertura"],
      ["9h às 12h", "Apresentações de trabalhos"],
      ["18h30 às 21h30", "Apresentações de trabalhos"],
    ],
  },
  {
    rotulo: "2º dia",
    data: "Quinta, 10/12/2026",
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
      <div className="jr-container-amplo">
        <TituloSecao
          id="titulo-programacao"
          subtitulo="Dia e horário de cada apresentação divulgados em 05/12/2026 · UNINASSAU Teresina"
        >
          Programação
        </TituloSecao>

        <div className="mt-9 grid gap-8 md:grid-cols-2">
          {DIAS.map((dia) => (
            <div
              key={dia.rotulo}
              className="overflow-hidden rounded-2xl border border-linea bg-white shadow-[0_8px_24px_rgba(1,28,99,0.08)]"
            >
              <h3 className="flex items-center gap-3 bg-navy bg-[radial-gradient(80%_160%_at_0%_0%,rgba(0,64,206,0.6)_0%,rgba(1,28,99,0)_70%)] px-5 py-4 font-heading text-[1.1rem] font-bold text-white">
                <span className="rounded-full bg-amarelo px-3 py-1 text-[0.85rem] font-extrabold text-navy">{dia.rotulo}</span>
                {dia.data}
              </h3>
              <ul className="divide-y divide-linea px-5">
                {dia.itens.map(([hora, texto]) => (
                  <li
                    key={hora}
                    className="grid min-h-[3.5rem] grid-cols-1 items-center gap-x-4 gap-y-1 py-3 sm:grid-cols-[9.5rem_1fr]"
                  >
                    <strong className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#e8eefc] px-3 py-1 font-heading text-[0.9rem] font-bold text-navy">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {hora}
                    </strong>
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
