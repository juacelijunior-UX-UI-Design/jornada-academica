import { Download, Eye, FileText } from "lucide-react";
import { EDITAL, MODELOS } from "@/lib/evento";

const botao =
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 font-semibold no-underline transition";
const botaoModelo =
  "inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-navy bg-white px-3.5 text-[0.9rem] font-semibold text-navy no-underline transition hover:bg-navy hover:text-white";

// Cartão "Leia o edital antes de enviar": edital, regras principais e modelos de banner e comunicação oral.
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
            className={`${botao} flex-1 bg-navy text-white hover:bg-royal`}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Visualizar edital
          </a>
          <a
            href={EDITAL}
            download="edital-vi-jornada-academica-2026.pdf"
            className={`${botao} flex-1 border-2 border-navy text-navy hover:bg-navy hover:text-white`}
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
        <li>
          Quem <strong>apresentar o trabalho</strong> recebe o certificado de <strong>20 horas</strong>. Sem
          apresentação, com presença registrada no evento, o certificado é de 4 horas.
        </li>
      </ul>

      <hr className="my-5 border-linea" />

      <h3 className="font-heading text-[1.05rem] font-bold text-navy">Modelo de banner</h3>
      <p className="mt-1 text-[0.9rem] text-tinta-suave">Baixe o modelo oficial do banner em PDF.</p>
      <div className="mt-4 grid max-w-md gap-3">
        {/* Só o modelo de banner, e só em PDF */}
        {MODELOS.filter((m) => m.rotulo === "Banner").map((m) => {
          const Icone = FileText;
          return (
            <div key={m.titulo} className="rounded-lg border border-linea bg-fundo/60 p-4">
              <p className="m-0 flex items-center gap-2 font-semibold text-navy">
                <Icone className="h-5 w-5 flex-none text-royal" aria-hidden="true" />
                {m.rotulo}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {m.arquivos.filter((a) => a.tipo === "PDF").map((a) => (
                  <a
                    key={a.tipo}
                    href={a.url}
                    download={a.nome}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Baixar modelo de ${m.rotulo.toLowerCase()} em ${a.tipo}`}
                    className={botaoModelo}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Baixar modelo (PDF)
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
