// Regras puras (navegador e servidor): CPF, máscaras, formatos e validação do formulário.

export const OUTROS = "__outros__";
export const RESUMO_MAX = 2000;
export const TITULO_MAX = 200;
export const ARQUIVO_MAX_MB = 10;
export const ARQUIVO_EXTENSOES = [".pdf", ".doc", ".docx", ".odt", ".ppt", ".pptx", ".odp"];
export const MAX_COAUTORES = 9;

// Limpa a lista de co-autores: remove vazios e espaços sobrando.
export function normalizarCoautores(lista) {
  return (Array.isArray(lista) ? lista : [])
    .map((nome) => String(nome ?? "").trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

export const apenasDigitos = (v) => String(v ?? "").replace(/\D/g, "");

export const normalizarFormato = (valor) =>
  typeof valor === "string"
    ? valor
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[\s-]+/g, "_")
    : "";

export function mascaraCpf(v) {
  const d = apenasDigitos(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function mascaraTelefone(v) {
  const d = apenasDigitos(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const mascaraMatricula = (v) => apenasDigitos(v).slice(0, 20);

export function normalizarTelefone(valor) {
  let d = apenasDigitos(valor);
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  return d;
}

export function cpfValido(cpf) {
  const d = apenasDigitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (base) => {
    let soma = 0;
    for (let i = 0; i < base.length; i += 1) soma += Number(base[i]) * (base.length + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return dv(d.slice(0, 9)) === Number(d[9]) && dv(d.slice(0, 10)) === Number(d[10]);
}

export const mascararCpf = (cpf) => {
  const d = apenasDigitos(cpf);
  return d.length === 11 ? `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**` : "***.***.***-**";
};

export const tamanhoResumo = (t) => String(t ?? "").replace(/\r\n?/g, "\n").trim().length;

export function formatarTamanho(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

export function validarArquivo(arquivo) {
  if (!arquivo) return "Anexe o arquivo do seu trabalho (PDF, DOC, DOCX ou ODT).";
  const nome = arquivo.name.toLowerCase();
  if (!ARQUIVO_EXTENSOES.some((ext) => nome.endsWith(ext))) return "Envie um arquivo PDF, DOC, DOCX, ODT, PPT, PPTX ou ODP.";
  if (arquivo.size === 0) return "O arquivo está vazio.";
  if (arquivo.size > ARQUIVO_MAX_MB * 1024 * 1024) return `O arquivo deve ter até ${ARQUIVO_MAX_MB} MB.`;
  return "";
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Recebe os valores do formulário e devolve { campo: mensagem } só com os inválidos.
export function validarInscricao(v) {
  const e = {};
  const nome = String(v.nome ?? "").trim();
  if (!nome) e.nome = "Informe seu nome completo.";
  else if (nome.split(/\s+/).filter(Boolean).length < 2) e.nome = "Informe nome e sobrenome.";
  else if (/\d/.test(nome)) e.nome = "O nome não pode ter números.";
  else if (nome.length > 150) e.nome = "O nome deve ter até 150 caracteres.";

  const coautores = normalizarCoautores(v.coautores);
  if (coautores.length > MAX_COAUTORES) {
    e.coautores = `Informe no máximo ${MAX_COAUTORES} co-autores.`;
  } else if (coautores.some((nome) => /\d/.test(nome) || nome.length > 150)) {
    e.coautores = "Revise os nomes dos co-autores: sem números e até 150 caracteres.";
  }

  const email = String(v.email ?? "").trim();
  if (!email) e.email = "Informe seu e-mail.";
  else if (!EMAIL.test(email)) e.email = "E-mail inválido.";
  else if (email.length > 150) e.email = "O e-mail deve ter até 150 caracteres.";

  const tel = normalizarTelefone(v.telefone);
  if (!tel) e.telefone = "Informe seu telefone.";
  else if (tel.length < 10 || tel.length > 11) e.telefone = "Informe o telefone com DDD.";

  if (!String(v.cpf ?? "").trim()) e.cpf = "Informe seu CPF.";
  else if (/[A-Za-z]/.test(v.cpf) || !cpfValido(v.cpf)) e.cpf = "CPF inválido.";

  if (v.tipo === "aluno") {
    const mat = apenasDigitos(v.matricula);
    if (!mat) e.matricula = "Informe sua matrícula.";
    else if (mat.length < 4 || mat.length > 20) e.matricula = "A matrícula deve ter de 4 a 20 dígitos.";
  }

  if (!v.curso) e.curso = "Selecione seu curso.";
  else if (v.curso === OUTROS) {
    const outro = String(v.curso_outro ?? "").trim();
    if (outro.length < 2) e.curso_outro = "Digite o nome do curso.";
    else if (outro.length > 100) e.curso_outro = "O nome do curso deve ter até 100 caracteres.";
  }

  if (v.tipo === "externo") {
    const inst = String(v.instituicao ?? "").trim();
    if (!inst) e.instituicao = "Informe a instituição de origem.";
    else if (inst.length > 150) e.instituicao = "Use até 150 caracteres.";
  }

  if (!v.disciplina) e.disciplina = "Selecione sua disciplina.";
  if (!v.formato) e.formato = "Selecione o formato da apresentação.";

  const titulo = String(v.titulo ?? "").trim();
  if (!titulo) e.titulo = "Informe o título do trabalho.";
  else if (titulo.length < 5) e.titulo = "O título deve ter pelo menos 5 caracteres.";
  else if (titulo.length > TITULO_MAX) e.titulo = `O título deve ter até ${TITULO_MAX} caracteres.`;

  const tamResumo = tamanhoResumo(v.resumo);
  if (!tamResumo) e.resumo = "Escreva o resumo do seu trabalho.";
  else if (tamResumo > RESUMO_MAX) e.resumo = `O resumo deve ter até ${RESUMO_MAX} caracteres.`;

  if (!v.aceite) e.aceite = "Aceite o uso dos dados para continuar.";

  const erroArquivo = validarArquivo(v.arquivo);
  if (erroArquivo) e.arquivo = erroArquivo;
  return e;
}