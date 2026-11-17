// Corpo do e-mail de confirmação da inscrição, com o QR Code embutido (somente servidor).
const LOGO = "https://media.base44.com/images/public/6afc5f6bdef0a308e8558411/23f60c835_logo.png";
const MARCA = "VI Jornada Acadêmica da Uninassau Teresina";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const escapar = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ESCAPES[c]);

export function htmlConfirmacao({ nome, titulo, ingressoUrl }) {
  const primeiroNome = escapar(nome);
  const trabalho = escapar(titulo);
  const link = escapar(ingressoUrl);

  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Inscrição confirmada</title></head>
<body style="margin:0;padding:0;background-color:#e6ecf9;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e6ecf9;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border:1px solid #e5e5e5;">
<tr><td style="background-color:#ffcb0c;padding:20px 36px;">
<img src="${LOGO}" alt="${MARCA}" width="140" style="display:block;border:0;height:auto;max-width:140px;">
</td></tr>
<tr><td style="padding:36px 36px 8px;">
<h1 style="margin:0;font-family:'Montserrat',Arial,sans-serif;font-weight:800;font-size:28px;line-height:1.2;color:#011c63;">Inscrição confirmada, ${primeiroNome}!</h1>
<p style="margin:10px 0 0;font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6;color:#5b6480;">Guarde o QR Code abaixo: ele é o seu ingresso na ${MARCA}.</p>
</td></tr>
<tr><td style="padding:24px 36px 8px;" align="center">
<img src="cid:ingresso@jornada" alt="QR Code de identificação" width="240" style="display:block;border:0;width:240px;height:auto;">
${trabalho ? `<p style="margin:12px 0 0;font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.5;color:#5b6480;text-align:center;">${trabalho}</p>` : ""}
</td></tr>
<tr><td style="padding:8px 36px 16px;">
<p style="margin:0;font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1f36;">Apresente este QR Code nos dias do evento (09 e 10/12/2026) para registrar a sua presença. Ela será usada para a emissão do certificado.</p>
<p style="margin:12px 0 0;font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1f36;">Você também pode ver o QR Code no site, entrando com o mesmo e-mail da inscrição.</p>
</td></tr>
<tr><td style="padding:8px 36px 36px;" align="center">
<a href="${link}" style="display:inline-block;background-color:#ffcb0c;color:#000000;font-family:'Montserrat',Arial,sans-serif;font-weight:700;font-size:15px;text-decoration:none;padding:14px 28px;">Abrir meu ingresso no site</a>
</td></tr>
<tr><td style="background-color:#011c63;padding:18px 36px;" align="center">
<p style="margin:0;font-family:Inter,Arial,sans-serif;font-size:12px;line-height:1.5;color:#ffffff;">${MARCA}</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}