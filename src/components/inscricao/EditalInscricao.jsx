import { Download, Eye } from "lucide-react";
import { EDITAL } from "@/lib/evento";

// Cartão "Leia o edital antes de enviar", com as regras principais já divulgadas no site.
export default function EditalInscricao() {
  return (
    <section aria-labelledby="titulo-edital" className="jr-card p-5 sm:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1">
          <h2 id="titulo-edital" className="font-heading text-[1.2rem] font-bold text-navy">
            Leia o edital antes de enviar
          </h2>
          <p className="mt-1 text-[0.95rem] text-tinta">
            Inscrições de <strong>16 a 30 de novembro de 2026</strong>. Trabalhos selecionados
            divulgados em <strong>05/12/2026</strong>, com o dia e o horário da apresentação.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:flex-col md:items-stretch">
          <a
            href={EDITAL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-navy px-4 font-semibold text-white no-underline transition hover:bg-royal"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Visualizar edital
          </a>
          <a
            href={EDITAL}
            download="edital-vi-jornada-academica-2026.pdf"
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border-2 border-navy px-4 font-semibold text-navy no-underline transition hover:bg-navy hover:text-white"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Baixar edital (PDF)
          </a>
        </div>
      </div>

      <hr className="my-5 border-linea" />

      <ul className="m-0 list-disc space-y-1.5 pl-5 text-[0.95rem] text-tinta">
        <li>
          <strong>APIExt I, III e V:</strong> apresentação em banner. <strong>APIExt II, IV e VI:</strong>{" "}
          comunicação oral. Os demais trabalhos escolhem o formato.
        </li>
        <li>A inscrição é obrigatória para os alunos das disciplinas de APIExt (I a VI).</li>
        <li>Cada apresentação dura 10 minutos e é avaliada por pelo menos um professor ou profissional da área.</li>
      </ul>
    </section>
  );
}
