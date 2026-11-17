import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import Botao from "@/components/site/Botao";

export default function IngressoCard({ ingresso }) {
  const [imagem, setImagem] = useState("");

  useEffect(() => {
    QRCode.toDataURL(ingresso.qr, {
      width: 420,
      margin: 2,
      color: { dark: "#011c63", light: "#ffffff" },
    }).then(setImagem);
  }, [ingresso.qr]);

  return (
    <article className="jr-card mx-auto max-w-md border-t-[5px] border-amarelo p-6 text-center">
      <p className="text-[0.85rem] font-semibold uppercase tracking-[0.08em] text-royal">
        Ingresso · VI Jornada Acadêmica
      </p>
      <h2 className="mt-1 font-heading text-[1.4rem] font-extrabold text-navy">{ingresso.nome}</h2>
      <p className="jr-legenda mt-1">CPF {ingresso.cpf}</p>
      {ingresso.titulo && <p className="mt-2 text-[0.95rem] text-tinta-suave">{ingresso.titulo}</p>}

      <div className="mx-auto mt-5 flex h-[260px] w-[260px] items-center justify-center rounded-lg border border-linea bg-white">
        {imagem ? (
          <img src={imagem} alt="QR Code de identificação do participante" className="h-full w-full" />
        ) : (
          <span className="text-sm text-tinta-suave">Gerando QR Code...</span>
        )}
      </div>

      <p className="jr-legenda mt-4">
        Apresente este QR Code nos dias do evento (09 e 10/12/2026) para registrar a sua presença.
      </p>

      {imagem && (
        <div className="mt-4 flex justify-center">
          <Botao href={imagem} download="qrcode-ingresso-jornada.png" variante="primario">
            <Download className="h-5 w-5" aria-hidden="true" />
            Baixar QR Code
          </Botao>
        </div>
      )}
    </article>
  );
}