import { useState } from "react";
import { Link } from "@tanstack/react-router";
import FaqItem from "@/components/landing/FaqItem";
import TituloSecao from "@/components/landing/TituloSecao";
import { REDES } from "@/lib/evento";

const PERGUNTAS = [
  {
    id: "quem-pode",
    pergunta: "Quem pode inscrever um trabalho?",
    resposta:
      "Estudantes e profissionais de diversas áreas. A inscrição é obrigatória para os alunos das disciplinas de APIExt (I a VI). Outros trabalhos, vinculados ou não à instituição, também são aceitos: relatos de experiência, resultados de pesquisa, trabalhos de conclusão de curso, entre outros.",
  },
  {
    id: "qr-code",
    pergunta: "Onde encontro meu QR Code de acesso?",
    resposta:
      "Assim que você confirma sua inscrição no formulário de inscrição, seu QR Code único é enviado para o seu e-mail.",
  },
  {
    id: "qr-atividades",
    pergunta: "Quem submeteu trabalho pode assistir a outras atividades?",
    resposta:
      "Pode. O QR Code da submissão vale para todas as atividades do evento (palestras, minicursos e sessões de apresentação): faça o check-in na entrada de cada uma. O certificado continua sendo um só: 20 horas para quem apresentar o trabalho. As outras atividades não somam horas.",
  },
  {
    id: "apresentacao",
    pergunta: "Como funciona a apresentação?",
    resposta:
      "Cada apresentação, de banner ou oral, dura 10 minutos e é avaliada por pelo menos um professor ou profissional da área. Os banners precisam estar posicionados 30 minutos antes do turno (manhã até as 8h, noite até as 18h). Quem apresenta oralmente entrega o material 10 minutos antes da sessão e leva o próprio computador com saída HDMI.",
  },
  {
    id: "dia-horario",
    pergunta: "Quando saberei o dia e o horário da minha apresentação?",
    resposta:
      "Em 05/12/2026, junto com a divulgação dos trabalhos selecionados, pela rede social do evento.",
  },
  {
    id: "certificado",
    pergunta: "Como recebo meu certificado?",
    resposta: (
      <>
        A partir de 14/12, após a validação da participação, acesse a{" "}
        <Link to="/certificado" className="font-semibold text-royal underline">
          página Certificados
        </Link>
        . Os dados do certificado são de responsabilidade de quem fez a inscrição.
      </>
    ),
  },
];

export default function FaqJornada() {
  const [abertas, setAbertas] = useState(() => [PERGUNTAS[0].id]);

  const alternar = (id) =>
    setAbertas((atual) =>
      atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]
    );

  return (
    <section id="faq" aria-labelledby="titulo-faq" className="bg-white py-14 lg:py-16">
      <div className="jr-container-amplo">
        <TituloSecao id="titulo-faq">Perguntas frequentes</TituloSecao>

        <ul className="mx-auto mt-9 max-w-[56rem] list-none space-y-3 p-0">
          {PERGUNTAS.map((item) => (
            <FaqItem
              key={item.id}
              id={item.id}
              pergunta={item.pergunta}
              resposta={item.resposta}
              aberto={abertas.includes(item.id)}
              onToggle={() => alternar(item.id)}
            />
          ))}
        </ul>

        <p className="mx-auto mt-6 max-w-[56rem] text-center text-[0.95rem] text-tinta-suave">
          Todas as normas e novidades da Jornada são divulgadas neste site e no Instagram{" "}
          <a
            href={REDES.instagram}
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-royal underline"
          >
            {REDES.usuario}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
