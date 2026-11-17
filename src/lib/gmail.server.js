// Envio de e-mail pela conta Gmail conectada (somente servidor).
const ENDPOINT = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";

const bytes = (texto) => new TextEncoder().encode(texto);

function binario(b) {
  let s = "";
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return s;
}

const base64 = (b) => btoa(binario(b));

// Linhas de 76 colunas, como pede o padrão MIME.
const emLinhas = (b64) => b64.replace(/(.{76})/g, "$1\r\n");

// O assunto é sempre codificado em UTF-8 para os acentos chegarem certos.
const assuntoCodificado = (texto) => `=?UTF-8?B?${base64(bytes(texto))}?=`;

function montarMime({ para, assunto, html, imagem }) {
  const limite = `jornada-${Math.random().toString(36).slice(2)}`;
  const partes = [
    `To: ${para}`,
    `Subject: ${assuntoCodificado(assunto)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/related; boundary="${limite}"`,
    "",
    `--${limite}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    emLinhas(base64(bytes(html))),
  ];
  if (imagem) {
    partes.push(
      `--${limite}`,
      'Content-Type: image/png; name="ingresso.png"',
      "Content-ID: <ingresso@jornada>",
      'Content-Disposition: inline; filename="ingresso.png"',
      "Content-Transfer-Encoding: base64",
      "",
      emLinhas(base64(imagem))
    );
  }
  partes.push(`--${limite}--`, "");
  return partes.join("\r\n");
}

// Devolve true quando o Gmail aceitou a mensagem.
export async function enviarPorGmail(base44, { para, assunto, html, imagem }) {
  const conectores = (base44.asServiceRole ?? base44).connectors;
  const { accessToken } = await conectores.getConnection("gmail");
  const raw = base64(bytes(montarMime({ para, assunto, html, imagem })))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const resposta = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  return resposta.ok;
}