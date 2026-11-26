import { Link } from "@tanstack/react-router";
import { Image } from "@/components/ui/image";
import CoautoresDialog from "@/components/site/CoautoresDialog";
import { DEV, EVENTO, FAIXAS, LOGO_JORNADA, ORIENTADOR, REDES, SITE } from "@/lib/evento";

const NAVEGACAO = [
  { texto: "O evento", to: "/", hash: "sobre" },
  { texto: "Programação", to: "/", hash: "programacao" },
  { texto: "Cronograma", to: "/", hash: "cronograma" },
  { texto: "Inscrição", to: "/inscricao" },
  { texto: "Certificado", to: "/certificado" },
  { texto: "Validar certificado", to: "/validar" },
  { texto: "Seja monitor", to: "/monitores" },
];

const rotulo = "mb-4 text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#8f9fd1]";
const lista = "m-0 list-none space-y-2.5 p-0 text-[0.95rem] leading-snug text-[#dbe2f5] sm:whitespace-nowrap";
const link = "text-[#dbe2f5] no-underline transition-colors hover:text-amarelo";

export default function SiteFooter() {
  return (
    <footer className="relative mt-16 overflow-hidden border-t-4 border-amarelo bg-[#0d1f73] pb-16 pt-14 text-white">
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

      <div className="jr-container relative z-10 max-w-[1400px]">
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-[auto_auto_auto] lg:justify-between xl:grid-cols-[minmax(0,1fr)_auto_auto_auto] xl:gap-x-16">
          <div className="sm:col-span-2 lg:col-span-3 lg:flex lg:items-center lg:gap-10 xl:col-span-1 xl:block">
            <Link
              to="/"
              aria-label="Página inicial da VI Jornada Acadêmica"
              className="inline-block rounded-xl bg-white px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
            >
              <Image
                src={LOGO_JORNADA}
                alt="VI Jornada Acadêmica da Uninassau Teresina"
                fittingType="fit"
                className="h-20 w-auto sm:h-24"
              />
            </Link>
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-[#dbe2f5] lg:mt-0 lg:max-w-xl xl:mt-5 xl:max-w-sm">
              “{EVENTO.lema.replace(/\.$/, "")}”. Inscrição e apresentação de trabalhos em dois dias de
              programação acadêmica, {EVENTO.datas}, na UNINASSAU Teresina, Piauí.
            </p>
          </div>

          <nav aria-label="Rodapé">
            <p className={rotulo}>Navegação</p>
            <ul className={lista}>
              {NAVEGACAO.map((l) => (
                <li key={l.texto}>
                  <Link to={l.to} hash={l.hash} className={link}>
                    {l.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className={rotulo}>Organização</p>
            <ul className={lista}>
              <li>{EVENTO.local}</li>
              <li>09 e 10 de dezembro de 2026</li>
              <li>
                Professor orientador: <strong className="whitespace-nowrap font-semibold text-white">{ORIENTADOR}</strong>
              </li>
              <li>
                <CoautoresDialog
                  comIcone={false}
                  gatilhoClasse="p-0 text-left text-[#dbe2f5] transition-colors hover:text-amarelo"
                />
              </li>
              <li>
                <Link
                  to="/painel"
                  className="text-[#b9c4ec] underline decoration-[#7f8fd6] underline-offset-4 transition-colors hover:text-amarelo"
                >
                  Painel administrativo
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className={rotulo}>Redes sociais</p>
            <ul className={lista}>
              <li>
                <a
                  href={REDES.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Instagram do evento: ${REDES.usuario} (abre em nova aba)`}
                  className={`${link} break-words`}
                >
                  {REDES.usuario}
                </a>
              </li>
              <li>
                <a href={SITE} target="_blank" rel="noopener noreferrer" className={link}>
                  uninassau.edu.br
                </a>
              </li>
            </ul>
            <p className="mt-4 text-[0.95rem] text-[#dbe2f5] sm:whitespace-nowrap">Acompanhe novidades sobre o evento.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-[0.75rem] uppercase tracking-[0.14em] text-[#8f9fd1] lg:flex-row lg:items-center lg:justify-between">
          <span>© 2026 UNINASSAU · Teresina — PI</span>
          <span className="normal-case tracking-normal lg:text-right lg:text-[0.8rem]">
            Desenvolvido por{" "}
            {DEV.map((d, i) => (
              <span key={d.nome}>
                {d.url ? (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#dbe2f5] no-underline hover:text-amarelo"
                  >
                    {d.nome}
                  </a>
                ) : (
                  <strong className="font-semibold text-[#dbe2f5]">{d.nome}</strong>
                )}
                {i === DEV.length - 1 ? "" : i === DEV.length - 2 ? " e " : ", "}
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
