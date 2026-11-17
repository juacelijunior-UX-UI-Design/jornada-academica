import { useEffect, useRef, useState } from "react";

// Lê QR Codes com a câmera traseira; ignora a mesma leitura repetida em até 3 segundos.
export default function LeitorQr({ onLeitura }) {
  const callback = useRef(onLeitura);
  callback.current = onLeitura;
  const [erro, setErro] = useState("");

  useEffect(() => {
    let leitor = null;
    let cancelado = false;
    let ultima = { texto: "", em: 0 };

    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelado) return;
      leitor = new Html5Qrcode("leitor-qr");
      try {
        await leitor.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 230, height: 230 } },
          (texto) => {
            if (texto === ultima.texto && Date.now() - ultima.em < 3000) return;
            ultima = { texto, em: Date.now() };
            callback.current(texto);
          },
          () => {}
        );
      } catch {
        setErro("Não foi possível abrir a câmera. Verifique a permissão ou use o CPF.");
      }
    })();

    return () => {
      cancelado = true;
      if (leitor) leitor.stop().then(() => leitor.clear()).catch(() => {});
    };
  }, []);

  return (
    <div>
      <div id="leitor-qr" className="mx-auto w-full max-w-sm overflow-hidden rounded-lg bg-black/5" />
      {erro && <p className="jr-erro text-center">{erro}</p>}
    </div>
  );
}