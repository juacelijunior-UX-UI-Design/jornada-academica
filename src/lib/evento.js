// Dados fixos do evento (equivalente ao js/config.js do projeto original).
export const EVENTO = {
  nome: "VI Jornada Acadêmica da Uninassau Teresina",
  nomeCurto: "VI Jornada Acadêmica",
  instituicao: "UNINASSAU Teresina · Piauí",
  datas: "09 e 10/12/2026",
  inscricoes: "Inscrições de 16 a 30/11/2026",
  local: "UNINASSAU Teresina - PI",
  lema: "Conhecimento que conecta pessoas e transforma realidades.",
};

export const RESUMO_MAX = 2000;
export const ARQUIVO_MAX_MB = 10;
export const ARQUIVO_EXTENSOES = [".pdf", ".doc", ".docx", ".odt"];
export const OUTROS = "__outros__";

export const DISCIPLINAS = [
  "APIExt I",
  "APIExt II",
  "APIExt III",
  "APIExt IV",
  "APIExt V",
  "APIExt VI",
  "PIC",
  "Outras",
];

export const FORMATOS = { banner: "Banner", comunicacao_oral: "Comunicação oral" };

// Regra do edital: APIExt I, III e V = banner; II, IV e VI = comunicação oral.
export const FORMATO_AUTOMATICO = {
  "APIExt I": "banner",
  "APIExt III": "banner",
  "APIExt V": "banner",
  "APIExt II": "comunicacao_oral",
  "APIExt IV": "comunicacao_oral",
  "APIExt VI": "comunicacao_oral",
};

export const CURSOS = [
  "Administração",
  "Análise e Desenvolvimento de Sistemas",
  "Ciências Contábeis",
  "Design",
  "Direito",
  "Enfermagem",
  "Engenharia Civil",
  "Estética e Cosmética",
  "Farmácia",
  "Fisioterapia",
  "Fonoaudiologia",
  "Gestão de Recursos Humanos",
  "História",
  "Medicina",
  "Medicina Veterinária",
  "Odontologia",
  "Pedagogia",
  "Psicologia",
  "Publicidade e Propaganda",
  "Radiologia",
  "Terapia Ocupacional",
];

export const ORIENTADOR = "Juaceli Junior";

export const DEV = [
  { nome: "Carlos Rony", rotulo: "Instagram", url: "https://www.instagram.com/c.r_rony" },
  { nome: "Hernandes Sales", rotulo: "Portfólio", url: "https://linkhernandess.vercel.app/" },
  { nome: "Miqueias Santos", rotulo: "LinkedIn", url: "https://www.linkedin.com/in/miqueias-santos-a8a92bb5" },
];

export const REDES = {
  instagram: "https://www.instagram.com/vi_jornadaacademicauninassau",
  usuario: "@vi_jornadaacademicauninassau",
};

export const SITE = "https://www.uninassau.edu.br";

export const EQUIPES = [
  "Agostinho Pereira de Souza Neto",
  "Ana Letícia Brandão Costa Sousa",
  "Antonio Jose Barros Silva Filho",
  "Ataniel Lucas Bacelar Soares de Sousa",
  "Cleverton Robson Carvalho Brasil",
  "Danillo Vinicius Alves Costa",
  "David Beckham de Oliveira Delmiro",
  "Erasmo Vinícius Lima de Carvalho",
  "Erick Wendler Ferreira Sousa Silva Nascimento",
  "Fernando Adryan Moura Lima",
  "Francisco de Sales Fortes Neto",
  "Francisco Vitor Santos Lima",
  "Franscisco Arthur Gomes Lima e Silva",
  "Gabriel Melo Mendes",
  "Gilvan de Sousa Gervasio",
  "Giulianno Lustosa Silva Gomes",
  "Guilherme Henrique Mendes da Fonseca",
  "Gustavo Mateus Santana Ferreira",
  "Italo Gabriel Santos Oliveira",
  "Italo Gustavo de Oliveira Soares",
  "Ithalo Morais Ferreira",
  "Jessica Hellen Carvalho da Silva",
  "Joao Victor Sousa de Assis",
  "José Rodolfo Ferreira Moura",
  "Kallyson Antonio Rodrigues de Deus",
  "Larissa Viana Pereira",
  "Lucas Emanuel Araujo da Silva",
  "Lucas Martins Santos",
  "Luis Gustavo Machado da Silva",
  "Luiz Claudio Brito Rocha de Sousa",
  "Marco Antonio de Sousa Lopes",
  "Marcos Aurélio Silva Machado",
  "Marcos da Silva Costa Junior",
  "Marcos Fernando Praxedes Nunes",
  "Marcos Paulo Feitosa Espinosa",
  "Marcos Vinícius Moreira Lima",
  "Marcus Vinicius Assuncao Bomfim",
  "Maria Clara da Cunha Araujo",
  "Maria Heloisa Mendes",
  "Maria Letícia da Silva Xavier",
  "Marilia Medeiros Santos",
  "Marlon Willian Silva Costa",
  "Matheus Ferreira Barros",
  "Matheus Medeiros de Melo e Silva",
  "Mayson de Tacio Freire Ferreia",
  "Michael Reis Vaz de Sousa",
  "Miguel Lucas Mendes do Monte",
  "Miqueias Silva dos Santos",
  "Natanael Lima Fernandez",
  "Pedro Gabriel de Almeida Avelino",
  "Raysllane Amanda de Souza Andrade",
  "Rosanne Mayara Rodrigues de Sousa",
  "Sarah Rebeca Leão de Moraes",
  "Victor Emanuel Pereira da Silva",
  "Victor Lucas Batista e Silva",
  "Vinícius José Pereira Lopes",
  "Wagner Vinícius de Sousa Bastos Moura",
  "Wenderson Victhor Sousa Bezerra",
];

export const EDITAL = "/assets/edital-vi-jornada-academica-2026.pdf";
export const LOGO_UNINASSAU = "/assets/logo-uninassau-horizontal.png";
export const LOGO_JORNADA = "/assets/logo-6-jornada-recorte.png";
export const FAIXAS = "/assets/faixas-vetoriais.png";
export const HERO_FOTO = "/assets/hero-estudantes-1536.webp";
export const HERO_FOTO_MENOR = "/assets/hero-estudantes-768.webp";