import { CalendarDays, Download, FilePlus2, MapPin, PencilLine } from "lucide-react";
import { Image } from "@/components/ui/image";
import Botao from "@/components/site/Botao";
import {
  EDITAL,
  EVENTO,
  FAIXAS,
  HERO_FOTO,
  LOGO_JORNADA,
} from "@/lib/evento";

const INFO = [
  { Icone: CalendarDays, texto: EVENTO.datas },
  { Icone: PencilLine, texto: EVENTO.inscricoes },
  { Icone: MapPin, texto: `${EVENTO.local} · Evento presencial` },
];

export default function HeroJornada() {
  return (
    <section
      aria-labelledby="titulo-jornada"
      className="relative overflow-hidden bg-navy text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(86%_114%_at_26%_42%,rgba(0,64,206,0.62)_0%,rgba(0,64,206,0.24)_34%,rgba(1,28,99,0)_68%)]"
      />
      <Image
        src={FAIXAS}
        alt=""
        aria-hidden="true"
        fittingType="fit"
        className="pointer-events-none absolute bottom-0 left-0 w-[min(50vw,300px)] opacity-70"
      />

      <div className="jr-container-amplo relative z-10 grid items-stretch gap-9 py-12 lg:grid-cols-[1fr_47%] lg:gap-[3.6%] lg:py-16">
        <div className="flex min-w-0 flex-col justify-between gap-8">
          <div>
            <div className="inline-block max-w-full rounded-lg bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
              <h1 id="titulo-jornada" className="m-0 leading-none">
                <Image
                  src={LOGO_JORNADA}
                  alt="VI Jornada Acadêmica da Uninassau Teresina"
                  fittingType="fit"
                  className="h-20 w-auto sm:h-24"
                />
              </h1>
            </div>

            <p className="mt-6 text-[0.95rem] font-semibold uppercase tracking-[0.08em] text-white/85">
              {EVENTO.instituicao}
            </p>
            <p className="mt-2 max-w-[30rem] font-heading text-[clamp(1.25rem,5vw,1.65rem)] font-extrabold leading-[1.35] text-amarelo">
              {EVENTO.lema}
            </p>
          </div>

          <div>
            <ul className="space-y-3">
              {INFO.map(({ Icone, texto }) => (
                <li key={texto} className="flex items-center gap-3 text-[1.0625rem] font-semibold">
                  <Icone className="h-5 w-5 flex-none text-amarelo" aria-hidden="true" />
                  {texto}
                </li>
              ))}
            </ul>

            <div className="mt-7 grid max-w-[36rem] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Botao to="/inscricao" variante="cta" className="min-h-[3.25rem] w-full whitespace-nowrap px-4 text-[1.05rem]">
                <FilePlus2 className="h-5 w-5" aria-hidden="true" />
                Inscrições
              </Botao>
              <Botao
                href={EDITAL}
                download="edital-vi-jornada-academica-2026.pdf"
                variante="edital"
                className="min-h-[3.25rem] w-full whitespace-nowrap px-4 text-[1.05rem]"
              >
                <Download className="h-5 w-5" aria-hidden="true" />
                Baixar edital (PDF)
              </Botao>
            </div>
          </div>
        </div>

        <figure className="m-0 flex items-stretch">
          <Image
            src={HERO_FOTO}
            alt="Quatro estudantes sorridentes, de camiseta azul-marinho, olham juntos para a tela de um notebook em um pátio do campus."
            className="block aspect-[4/3] w-full rounded-[18px] bg-[#04101f] object-cover shadow-[12px_12px_0_0_#ffcb0c] lg:aspect-auto lg:h-full lg:min-h-[26rem] lg:w-[calc(100%-38px)]"
          />
        </figure>
      </div>
    </section>
  );
}