import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { CalendarDays, Download, Loader2, MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";
import { EVENTO, LOGO_JORNADA } from "@/lib/evento";

// Ingresso digital com cara de bilhete: faixa azul, QR Code no meio e "picote" separando o rodapé.
export default function IngressoCard({ ingresso }) {
  const [imagem, setImagem] = useState("");

  useEffect(() => {
    QRCode.toDataURL(ingresso.qr, {
      width: 480,
      margin: 1,
      color: { dark: "#011c63", light: "#ffffff" },
    }).then(setImagem);
  }, [ingresso.qr]);

  const participante = ingresso.tipo === "participante";

  return (
    <article className="mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(1,28,99,0.16)]">
      {/* Faixa do bilhete */}
      <div className="relative bg-navy bg-[linear-gradient(110deg,#011c63_0%,#0b2a86_55%,#1746b8_100%)] px-5 pb-5 pt-4 text-white">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-amarelo">Ingresso digital</span>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[0.72rem] font-semibold">
            {participante ? "Participante" : "Apresentador(a)"}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-white p-1">
            <Image src={LOGO_JORNADA} alt="" fittingType="fit" className="h-full w-auto" />
          </span>
          <div className="min-w-0">
            <p className="m-0 font-heading text-[1.05rem] font-extrabold leading-tight text-white">{EVENTO.nomeCurto}</p>
            <p className="m-0 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.8rem] text-white/80">
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                {EVENTO.datas}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {EVENTO.local}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="h-1 bg-amarelo" aria-hidden="true" />

      {/* Corpo */}
      <div className="px-5 pt-5 text-center sm:px-6">
        <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-tinta-suave">Nome:</p>
        <h2 className="m-0 mt-0.5 break-words font-heading text-[1.35rem] font-extrabold leading-tight text-navy">
          {ingresso.nome}
        </h2>
        <p className="m-0 mt-1 text-[0.85rem] text-tinta-suave">CPF {ingresso.cpf}</p>

        <div className="mx-auto mt-5 w-full max-w-[250px] rounded-xl border-2 border-dashed border-[#c9d3ec] p-3">
          <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-white">
            {imagem ? (
              <img src={imagem} alt="QR Code de identificação do participante" className="h-full w-full" />
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-tinta-suave">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Gerando QR Code…
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Picote */}
      <div className="relative my-5 flex items-center" aria-hidden="true">
        <span className="absolute -left-3 h-6 w-6 rounded-full bg-fundo" />
        <span className="mx-5 w-full border-t-2 border-dashed border-linea" />
        <span className="absolute -right-3 h-6 w-6 rounded-full bg-fundo" />
      </div>

      {/* Rodapé */}
      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        <p className="m-0 text-center text-[0.88rem] leading-snug text-tinta-suave">
          Apresente este QR Code na entrada, nos dias <strong className="font-semibold text-navy">{EVENTO.datas}</strong>,
          para registrar a sua presença.
        </p>
        {imagem && (
          <a
            href={imagem}
            download="qrcode-ingresso-jornada.png"
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-royal px-5 font-semibold text-white no-underline transition hover:bg-navy"
          >
            <Download className="h-5 w-5" aria-hidden="true" />
            Baixar QR Code
          </a>
        )}
      </div>
    </article>
  );
}
