import { Download, FilePlus2 } from "lucide-react";
import Botao from "@/components/site/Botao";
import { EDITAL, EVENTO } from "@/lib/evento";

const PARAGRAFOS = [
  "Em 2026, realizar-se-á a VI Jornada Acadêmica da Uninassau Teresina, com o tema “Conhecimento que conecta pessoas e transforma realidades”, nos dias 09 e 10 de dezembro de 2026. As normas de inscrição, submissão e apresentação de trabalhos estão no edital.",
  "A Jornada Acadêmica integra a estratégia de ampliação de atividades acadêmicas internas e externas da UNINASSAU Teresina que tem como objetivo ampliar e intensificar sua inserção na comunidade científica local, tendo em vista elevar o padrão da formação acadêmica dos alunos que está em total ligação com a sociedade.",
  "A VI Jornada Acadêmica da Uninassau será um espaço privilegiado para dar visibilidade às atividades de extensão realizadas, além de outros trabalhos científicos, fortalecendo e qualificando a formação acadêmica e profissional.",
  "O evento tem como propósito estratégico estimular a produção de conhecimento, a formação de recursos humanos e favorecer a troca de experiências entre os alunos das diversas áreas que compõem os cursos de graduação da unidade.",
];

const PASSOS = [
  "Inscreva o seu trabalho de 16 a 30/11.",
  "Em 05/12, confira os trabalhos selecionados e o dia e horário da apresentação nas redes sociais do evento.",
  "Apresente em 09 ou 10/12 e contribua com 1 kg de alimento não perecível no credenciamento.",
  "A partir de 14/12, consulte o certificado no site.",
];

export default function SobreJornada() {
  return (
    <section id="sobre" aria-labelledby="titulo-sobre" className="bg-navy py-14 text-white lg:py-20">
      <div className="jr-container">
        <h2 id="titulo-sobre" className="jr-titulo-bloco filete text-white">
          Sobre a Semana Acadêmica
        </h2>

        <div className="mt-7 max-w-[46rem] space-y-4 text-[1.0625rem] leading-relaxed text-white/90">
          {PARAGRAFOS.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>

        <p className="mt-8 max-w-[42rem] border-l-4 border-amarelo pl-4 font-heading text-[1.2rem] font-extrabold leading-snug text-white">
          {EVENTO.lema}
        </p>

        <h3 className="mt-12 font-heading text-[1.25rem] font-bold text-white">Como participar</h3>
        <ol className="mt-5 grid max-w-[58rem] gap-5 md:grid-cols-2">
          {PASSOS.map((passo, i) => (
            <li key={passo} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-amarelo font-heading text-base font-extrabold text-navy"
              >
                {i + 1}
              </span>
              <span className="text-[1.0625rem] leading-snug text-white/90">{passo}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Botao to="/inscricao" variante="cta">
            <FilePlus2 className="h-5 w-5" aria-hidden="true" />
            Inscrever meu trabalho
          </Botao>
          <Botao
            href={EDITAL}
            download="edital-vi-jornada-academica-2026.pdf"
            variante="edital"
          >
            <Download className="h-5 w-5" aria-hidden="true" />
            Baixar edital (PDF)
          </Botao>
        </div>
      </div>
    </section>
  );
}