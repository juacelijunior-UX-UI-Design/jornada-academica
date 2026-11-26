import { Download, Eye, FileText, Presentation, ScrollText } from "lucide-react";
import { BANNER_DIMENSOES, EDITAL, MODELOS } from "@/lib/evento";
import CartaoFaixa from "@/components/painel/CartaoFaixa";

const botao =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 font-semibold no-underline transition";
const botaoModelo =
  "inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-navy bg-white px-3 text-[0.85rem] font-semibold text-navy no-underline transition hover:bg-navy hover:text-white";

const DATAS = [
  { quando: "16 a 30/11/2026", oque: "Inscrições" },
  { quando: "05/12/2026", oque: "Divulgação dos selecionados, com dia e horário" },
  { quando: "09 e 10/12/2026", oque: "Apresentações na Jornada" },
];

// Painel lateral da inscrição: edital, datas, regras principais e modelos
// (comunicação oral em PDF e PPTX; banner só em PDF).
export default function EditalInscricao() {
  return (
    <CartaoFaixa Icone={ScrollText} titulo="Leia o edital antes de enviar" corpoClassName="space-y-5 p-5">
      <div className="grid gap-2">
        <a href={EDITAL} target="_blank" rel="noopener noreferrer" className={`${botao} bg-navy text-white hover:bg-royal`}>
          <Eye className="h-4 w-4" aria-hidden="true" />
          Visualizar edital
        </a>
        <a
          href={EDITAL}
          download="edital-vi-jornada-academica-2026.pdf"
          className={`${botao} border-2 border-navy text-navy hover:bg-navy hover:text-white`}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Baixar edital (PDF)
        </a>
      </div>

      <div>
        <h3 className="mb-2.5 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-navy">Datas importantes</h3>
        <ol className="m-0 list-none space-y-0 border-l-2 border-amarelo p-0 pl-4">
          {DATAS.map((d) => (
            <li key={d.quando} className="relative pb-3 last:pb-0">
              <span aria-hidden="true" className="absolute -left-[1.4rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-navy" />
              <strong className="block text-[0.9rem] font-semibold text-navy">{d.quando}</strong>
              <span className="block text-[0.85rem] leading-snug text-tinta-suave">{d.oque}</span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3 className="mb-2 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-navy">Regras principais</h3>
        <ul className="m-0 list-disc space-y-1.5 pl-5 text-[0.88rem] leading-snug text-tinta">
          <li>
            <strong>APIExt I, III e V:</strong> banner. <strong>APIExt II, IV e VI:</strong> comunicação oral. Os
            demais escolhem o formato.
          </li>
          <li>Inscrição obrigatória para os alunos de APIExt (I a VI).</li>
          <li>Cada apresentação dura 10 minutos, com avaliação de pelo menos um professor ou profissional da área.</li>
          <li>
            Quem <strong>apresentar</strong> recebe certificado de <strong>20 horas</strong>; sem apresentação, com
            presença, é de 4 horas.
          </li>
          <li>
            O <strong>QR Code</strong> da submissão vale para <strong>todas as atividades</strong> do evento (palestras,
            minicursos e sessões). As outras atividades não somam horas ao certificado.
          </li>
        </ul>
      </div>

      <div>
        <h3 className="mb-1 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-navy">Modelos de documentos</h3>
        <p className="m-0 mb-2.5 text-[0.82rem] text-tinta-suave">Use o modelo do formato da sua apresentação.</p>
        <div className="grid gap-2.5">
          {MODELOS.map((m) => {
            const banner = m.rotulo === "Banner";
            const Icone = banner ? FileText : Presentation;
            // Banner: só o PDF novo. Comunicação oral: PDF e slides (PPTX).
            const arquivos = banner ? m.arquivos.filter((a) => a.tipo === "PDF") : m.arquivos;
            return (
              <div key={m.titulo} className="rounded-lg border border-linea bg-fundo/60 p-3">
                <p className="m-0 flex items-center gap-2 text-[0.95rem] font-semibold text-navy">
                  <Icone className="h-4 w-4 flex-none text-royal" aria-hidden="true" />
                  {m.rotulo}
                </p>
                {banner && (
                  <p className="m-0 mt-1 text-[0.82rem] text-tinta">
                    <strong className="font-semibold">Dimensões:</strong> {BANNER_DIMENSOES}
                  </p>
                )}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {arquivos.map((a) => (
                    <a
                      key={a.tipo}
                      href={a.url}
                      download={a.nome}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Baixar modelo de ${m.rotulo.toLowerCase()} em ${a.tipo}`}
                      className={botaoModelo}
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      {a.tipo === "PPTX" ? "Slides (PPTX)" : "PDF"}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </CartaoFaixa>
  );
}
