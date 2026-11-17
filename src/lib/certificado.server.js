// Código de autenticidade do certificado (XXXX-XXXX-XXXX), guardado no registro Certificado.
import { todos } from "@/lib/jornada.server";

export function novoCodigo() {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const h = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`;
}

export const CODIGO_VALIDO = /^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/;

// Devolve o código do participante, criando o registro do certificado quando ainda não existe.
export async function garantirCertificado(base44, aluno) {
  const existentes = await todos(base44.entities.Certificado.filter({ participante_id: aluno.id }));
  const atual = existentes[0];
  if (atual?.codigo) return atual.codigo;

  const codigo = novoCodigo();
  if (atual) {
    await base44.entities.Certificado.update(atual.id, { codigo });
  } else {
    await base44.entities.Certificado.create({
      participante_id: aluno.id,
      nome: aluno.nome,
      horas_presentes: aluno.horas_presentes,
      percentual: aluno.percentual,
      emitido_em: new Date().toISOString(),
      codigo,
    });
  }
  return codigo;
}