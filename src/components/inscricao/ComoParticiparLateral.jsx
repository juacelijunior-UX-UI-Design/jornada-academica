import { Award, CalendarDays, QrCode, UserPlus } from "lucide-react";
import CartaoFaixa from "@/components/painel/CartaoFaixa";
import { CARGA_HORARIA_PARTICIPANTE, DATA_LIBERACAO_CERTIFICADOS, EVENTO } from "@/lib/evento";

const LIBERACAO_BR = DATA_LIBERACAO_CERTIFICADOS.split("-").reverse().join("/");

const PASSOS = [
  { Icone: UserPlus, titulo: "Faça a inscrição", texto: "Com a conta Google ou preenchendo nome, CPF, telefone e e-mail." },
  { Icone: QrCode, titulo: "Guarde o QR Code", texto: "Ele aparece na hora e pode ser baixado no celular." },
  { Icone: CalendarDays, titulo: "Apresente no evento", texto: `Mostre o QR Code na entrada, em ${EVENTO.datas}.` },
  {
    Icone: Award,
    titulo: "Receba o certificado",
    texto: `${CARGA_HORARIA_PARTICIPANTE} horas, disponível a partir de ${LIBERACAO_BR}.`,
  },
];

// Painel lateral da aba Participante: como funciona, em 4 passos.
export default function ComoParticiparLateral() {
  return (
    <CartaoFaixa Icone={QrCode} titulo="Como funciona">
      <ol className="m-0 list-none space-y-4 p-0">
        {PASSOS.map(({ Icone, titulo, texto }, n) => (
          <li key={titulo} className="flex items-start gap-3">
            <span className="relative grid h-9 w-9 flex-none place-items-center rounded-full bg-navy text-amarelo">
              <Icone className="h-4 w-4" aria-hidden="true" />
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-amarelo text-[0.65rem] font-bold text-navy">
                {n + 1}
              </span>
            </span>
            <span className="min-w-0">
              <strong className="block text-[0.95rem] font-semibold text-navy">{titulo}</strong>
              <span className="block text-[0.88rem] leading-snug text-tinta-suave">{texto}</span>
            </span>
          </li>
        ))}
      </ol>
    </CartaoFaixa>
  );
}
