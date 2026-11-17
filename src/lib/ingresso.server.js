// Ingresso com QR Code: token secreto, leitura, PNG do QR e e-mail de confirmação (somente servidor).
import QRCode from "qrcode";
import { todos } from "@/lib/jornada.server";
import { enviarPorGmail } from "@/lib/gmail.server";
import { htmlConfirmacao } from "@/lib/email-confirmacao.server";

const SITE = "https://6jornadaacaduninassau.com";

export function novoToken() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Conteúdo do QR Code: SGJA|<id do participante>|<token secreto>
export const conteudoQr = (p) => `SGJA|${p.id}|${p.token_ingresso}`;

export function lerQr(texto) {
  const partes = String(texto || "").trim().slice(0, 200).split("|");
  if (partes.length !== 3 || partes[0] !== "SGJA" || !partes[1] || !/^[a-f0-9]{32}$/.test(partes[2])) return null;
  return { id: partes[1], token: partes[2] };
}

// Comparação que leva sempre o mesmo tempo, para não dar pistas a quem tenta adivinhar.
function iguais(a, b) {
  const x = String(a);
  const y = String(b);
  let dif = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) dif |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  return dif === 0;
}

export async function garantirToken(base44, p) {
  if (p.token_ingresso) return p;
  const token = novoToken();
  await base44.entities.Participante.update(p.id, { token_ingresso: token });
  return { ...p, token_ingresso: token };
}

export async function participantePorEmail(base44, email) {
  const lista = await todos(base44.entities.Participante.filter({ email: String(email || "").trim().toLowerCase() }));
  return lista[0] ?? null;
}

export async function localizarPorQr(base44, texto) {
  const q = lerQr(texto);
  if (!q) return { erro: "QR Code não pertence à Jornada." };
  let p = null;
  try {
    p = await base44.entities.Participante.get(q.id);
  } catch {
    p = null;
  }
  if (!p || !p.token_ingresso || !iguais(p.token_ingresso, q.token)) {
    return { erro: "QR Code inválido ou adulterado." };
  }
  return { p };
}

// Registra a presença uma única vez por participante e sessão.
export async function registrarPresencaUnica(base44, user, participante, sessaoId) {
  let sessao = null;
  try {
    sessao = await base44.entities.Sessao.get(sessaoId);
  } catch {
    sessao = null;
  }
  if (!sessao) return { erro: "Atividade não encontrada." };

  const existentes = await todos(
    base44.entities.Presenca.filter({ participante_id: participante.id, sessao_id: sessaoId })
  );
  if (existentes.length) return { novo: false, hora: existentes[0].created_date };

  const criada = await base44.entities.Presenca.create({
    participante_id: participante.id,
    sessao_id: sessaoId,
    registrado_por: user.full_name || user.email,
    registrado_por_email: user.email,
  });
  return { novo: true, hora: criada.created_date };
}

/* ---------- PNG do QR Code (1 bit, sem compressão) ---------- */

function crc32(buf) {
  let crc = 0xffffffff;
  for (let n = 0; n < buf.length; n += 1) {
    let c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(buf) {
  let a = 1;
  let b = 0;
  for (let i = 0; i < buf.length; i += 1) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function chunk(tipo, dados) {
  const t = new TextEncoder().encode(tipo);
  const out = new Uint8Array(12 + dados.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, dados.length);
  out.set(t, 4);
  out.set(dados, 8);
  const corpo = new Uint8Array(4 + dados.length);
  corpo.set(t, 0);
  corpo.set(dados, 4);
  view.setUint32(8 + dados.length, crc32(corpo));
  return out;
}

export function qrPng(texto, escala = 8, margem = 4) {
  const qr = QRCode.create(texto, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const dados = qr.modules.data;
  const lado = (n + margem * 2) * escala;
  const bytesLinha = Math.ceil(lado / 8);
  const raw = new Uint8Array((bytesLinha + 1) * lado).fill(0xff);

  for (let y = 0; y < lado; y += 1) {
    const inicio = y * (bytesLinha + 1);
    raw[inicio] = 0;
    const my = Math.floor(y / escala) - margem;
    if (my < 0 || my >= n) continue;
    for (let x = 0; x < lado; x += 1) {
      const mx = Math.floor(x / escala) - margem;
      if (mx >= 0 && mx < n && dados[my * n + mx]) raw[inicio + 1 + (x >> 3)] &= ~(0x80 >> (x & 7));
    }
  }

  const partes = [new Uint8Array([0x78, 0x01])];
  for (let i = 0; i < raw.length; i += 65535) {
    const bloco = raw.subarray(i, Math.min(i + 65535, raw.length));
    const final = i + 65535 >= raw.length ? 1 : 0;
    const len = bloco.length;
    partes.push(new Uint8Array([final, len & 0xff, len >> 8, ~len & 0xff, (~len >> 8) & 0xff]), bloco);
  }
  const adler = new Uint8Array(4);
  new DataView(adler.buffer).setUint32(0, adler32(raw));
  partes.push(adler);

  const total = partes.reduce((s, p) => s + p.length, 0);
  const zlib = new Uint8Array(total);
  let pos = 0;
  for (const p of partes) {
    zlib.set(p, pos);
    pos += p.length;
  }

  const ihdr = new Uint8Array(13);
  const v = new DataView(ihdr.buffer);
  v.setUint32(0, lado);
  v.setUint32(4, lado);
  ihdr[8] = 1; // 1 bit
  ihdr[9] = 0; // tons de cinza

  const assinatura = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const blocos = [assinatura, chunk("IHDR", ihdr), chunk("IDAT", zlib), chunk("IEND", new Uint8Array(0))];
  const png = new Uint8Array(blocos.reduce((s, b) => s + b.length, 0));
  let p = 0;
  for (const b of blocos) {
    png.set(b, p);
    p += b.length;
  }
  return png;
}

/* ---------- E-mail de confirmação com o QR Code (pelo Gmail) ---------- */

// Devolve true quando o e-mail foi enviado. Nunca interrompe a inscrição.
export async function enviarConfirmacao(base44, participante) {
  try {
    const p = await garantirToken(base44, participante);
    const nome = String(p.nome).trim().split(/\s+/)[0];

    return await enviarPorGmail(base44, {
      para: p.email,
      assunto: "Inscrição confirmada | VI Jornada Acadêmica Uninassau Teresina",
      html: htmlConfirmacao({
        nome,
        titulo: p.titulo || "",
        ingressoUrl: `${SITE}/minha-inscricao`,
      }),
      imagem: qrPng(conteudoQr(p)),
    });
  } catch {
    return false;
  }
}