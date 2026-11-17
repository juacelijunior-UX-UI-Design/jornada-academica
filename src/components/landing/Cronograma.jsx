import { Check } from "lucide-react";

const ETAPAS = [
  ["13/11", "Lançamento do edital"],
  ["16 a 30/11", "Período de inscrições"],
  ["05/12", "Divulgação dos trabalhos selecionados"],
  ["05/12", "Definição de dia e horário da apresentação"],
  ["09 e 10/12", "VI Jornada Acadêmica"],
  ["A partir de 14/12", "Certificados disponíveis no site"],
];

export default function Cronograma() {
  return (
    <section id="cronograma" aria-labelledby="titulo-cronograma" className="jr-container pb-16 lg:pb-20">
      <h2 id="titulo-cronograma" className="jr-titulo-bloco filete">
        Cronograma
      </h2>
      <ol className="jr-card mt-7 divide-y divide-linea px-6 py-2">
        {ETAPAS.map(([data, texto]) => (
          <li key={`${data}-${texto}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4">
            <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-fundo">
              <Check className="h-4 w-4 text-royal" aria-hidden="true" />
            </span>
            <strong className="min-w-[9rem] font-heading text-[0.95rem] text-navy">{data}</strong>
            <span className="text-[1.0625rem] text-tinta">{texto}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}