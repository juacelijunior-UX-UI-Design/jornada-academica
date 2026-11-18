import { Download, Eye, FolderOpen } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { EDITAL, EVENTO } from "@/lib/evento";

const botaoPequeno =
  "inline-flex min-h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-[0.9rem] font-semibold no-underline transition";

export default function SobreJornada() {
  return (
    <section id="sobre" aria-labelledby="titulo-sobre" className="py-14 lg:py-20">
      <div className="jr-container">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-12">
          <div>
            <h2 id="titulo-sobre" className="jr-titulo-bloco filete">
              Sobre o evento
            </h2>

            <div className="mt-6 space-y-4 text-[1.0625rem] leading-relaxed text-tinta [hyphens:auto] sm:text-justify">
              <p>
                Em 2026, realizar-se-á a <strong className="font-bold text-navy">VI Jornada Acadêmica</strong> da
                Uninassau Teresina, com o tema{" "}
                <strong className="font-bold text-navy">“{EVENTO.lema.replace(/\.$/, "")}”</strong>, nos dias 09 e
                10 de dezembro de 2026. As normas de inscrição, submissão e apresentação de trabalhos estão no
                edital.
              </p>
              <p>
                A Jornada Acadêmica integra a estratégia de ampliação de atividades acadêmicas internas e
                externas da UNINASSAU Teresina que tem como objetivo ampliar e intensificar sua inserção na
                comunidade científica local, tendo em vista elevar o padrão da formação acadêmica dos alunos que
                está em total ligação com a sociedade.
              </p>
              <p>
                A VI Jornada Acadêmica da Uninassau será um espaço privilegiado para dar visibilidade às
                atividades de extensão realizadas, além de outros trabalhos científicos, fortalecendo e
                qualificando a formação acadêmica e profissional.
              </p>
              <p>
                O evento tem como propósito estratégico estimular a produção de conhecimento, a formação de
                recursos humanos e favorecer a troca de experiências entre os alunos das diversas áreas que
                compõem os cursos de graduação da unidade.
              </p>
            </div>
          </div>

          <aside
            aria-labelledby="titulo-quem-participa"
            className="flex flex-col rounded-xl border-t-[5px] border-amarelo bg-white p-6 shadow-[0_8px_28px_rgba(1,28,99,0.12)] sm:p-7 lg:mt-2"
          >
            <h3 id="titulo-quem-participa" className="font-heading text-[1.3rem] font-extrabold text-navy">
              Quem pode participar
            </h3>
            <p className="mt-1 text-[0.95rem] text-tinta">Estudantes e profissionais de diversas áreas.</p>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-[0.95rem] leading-snug text-tinta">
              <li>
                <strong className="font-bold text-navy">Obrigatória</strong> para os alunos das disciplinas de
                APIExt (I a VI).
              </li>
              <li>
                Também são aceitos outros trabalhos, vinculados ou não à instituição: relatos de experiência,
                resultados de pesquisa, trabalhos de conclusão de curso, entre outros.
              </li>
              <li>Cada trabalho é inscrito pelo apresentador, com até 9 co-autores.</li>
              <li>Cada apresentação, de banner ou oral, dura 10 minutos.</li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              <a
                href={EDITAL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${botaoPequeno} bg-navy text-white hover:bg-royal`}
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Visualizar edital
              </a>
              <a
                href={EDITAL}
                download="edital-vi-jornada-academica-2026.pdf"
                className={`${botaoPequeno} border border-navy text-navy hover:bg-navy hover:text-white`}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Baixar edital (PDF)
              </a>
              <Link
                to="/modelos"
                className={`${botaoPequeno} border border-navy text-navy hover:bg-navy hover:text-white`}
              >
                <FolderOpen className="h-4 w-4" aria-hidden="true" />
                Modelos de documentos
              </Link>
            </div>
          </aside>
        </div>

      </div>
    </section>
  );
}
