import { Instagram, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
import CoautoresDialog from "@/components/site/CoautoresDialog";
import {
  DEV,
  EVENTO,
  FAIXAS,
  LOGO_JORNADA,
  LOGO_UNINASSAU,
  ORIENTADOR,
  REDES,
  SITE,
} from "@/lib/evento";

export default function SiteFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t-4 border-amarelo bg-navy pb-14 pt-10 text-white">
      <Image
        src={FAIXAS}
        alt=""
        aria-hidden="true"
        fittingType="fit"
        className="pointer-events-none absolute bottom-0 left-0 w-[min(55vw,320px)] opacity-90"
      />
      <Image
        src={FAIXAS}
        alt=""
        aria-hidden="true"
        fittingType="fit"
        className="pointer-events-none absolute bottom-0 right-0 w-[min(55vw,320px)] -scale-x-100 opacity-90"
      />

      <div className="jr-container relative z-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="inline-flex max-w-full items-center gap-4 rounded-lg bg-white px-4 py-2.5">
            <Image src={LOGO_UNINASSAU} alt="UNINASSAU Teresina" fittingType="fit" className="h-7 w-auto sm:h-9" />
            <span aria-hidden="true" className="h-8 w-px flex-none bg-linea" />
            <Image src={LOGO_JORNADA} alt="Logo da VI Jornada Acadêmica" fittingType="fit" className="h-7 w-auto sm:h-9" />
          </div>
          <p className="mt-4 max-w-md font-medium italic text-[#c9d2e6]">{EVENTO.lema}</p>
        </div>

        <div className="text-[0.95rem] text-[#c9d2e6]">
          <a
            href={REDES.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 inline-flex items-center gap-2 text-white no-underline hover:text-amarelo"
          >
            <Instagram className="h-5 w-5" aria-hidden="true" />
            <span>{REDES.usuario}</span>
          </a>
          <p className="mb-1 flex items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {EVENTO.local}
          </p>
          <a
            href={SITE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#c9d2e6] underline-offset-2 hover:text-amarelo hover:underline"
          >
            uninassau.edu.br
          </a>
        </div>

        <div className="space-y-1.5 border-t border-white/15 pt-5 text-[0.875rem] text-[#c9d2e6] lg:col-span-2">
          <p>
            Desenvolvido por{" "}
            {DEV.map((d, i) => (
              <span key={d.nome}>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-white hover:text-amarelo"
                >
                  {d.nome}
                </a>
                {i < DEV.length - 1 ? " e " : ""}
              </span>
            ))}
          </p>
          <p>
            Professor orientador: <strong className="text-white">{ORIENTADOR}</strong>
          </p>
          <div className="pt-1">
            <CoautoresDialog />
          </div>
        </div>
      </div>
    </footer>
  );
}