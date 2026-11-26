import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, GraduationCap, Loader2, Send, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { criarInscricao } from "@/lib/fn-inscricao";
import { OUTROS } from "@/lib/evento";
import { validarInscricao } from "@/lib/validacao";
import TipoSeletor from "@/components/inscricao/TipoSeletor";
import DadosPessoais from "@/components/inscricao/DadosPessoais";
import DadosTrabalho from "@/components/inscricao/DadosTrabalho";
import Coautores from "@/components/inscricao/Coautores";
import PainelSucesso from "@/components/inscricao/PainelSucesso";
import CartaoFaixa from "@/components/painel/CartaoFaixa";

const VAZIO = {
  tipo: "aluno",
  nome: "",
  coautores: [],
  email: "",
  telefone: "",
  cpf: "",
  matricula: "",
  instituicao: "",
  curso: "",
  curso_outro: "",
  disciplina: "",
  formato: "",
  titulo: "",
  resumo: "",
  aceite: false,
};

const TIPOS = [
  { valor: "aluno", texto: "Sou aluno da instituição", Icone: GraduationCap },
  { valor: "externo", texto: "Público externo", Icone: Users },
];

const ORDEM_CAMPOS = ["titulo", "disciplina", "curso", "curso_outro", "formato", "resumo", "arquivo", "nome", "email", "telefone", "cpf", "matricula", "instituicao"];

// Etapa do formulário: número em círculo, título e descrição curta.
function Secao({ numero, titulo, descricao, children }) {
  return (
    <section className="mt-8 border-t border-linea pt-7 first:mt-0 first:border-t-0 first:pt-0">
      <div className="mb-5 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid h-9 w-9 flex-none place-items-center rounded-full bg-navy font-heading text-[0.95rem] font-extrabold text-amarelo shadow-[0_3px_8px_rgba(1,28,99,0.25)]"
        >
          {numero}
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="m-0 font-heading text-[1.15rem] font-bold leading-tight text-navy">
            <span className="sr-only">Etapa {numero}: </span>
            {titulo}
          </h2>
          {descricao && <p className="m-0 mt-0.5 text-[0.88rem] text-tinta-suave">{descricao}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export default function FormularioInscricao({ aberta, motivo }) {
  const criar = useServerFn(criarInscricao);
  const [form, setForm] = useState(VAZIO);
  const [arquivo, setArquivo] = useState(null);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  function setCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
  }

  function setErro(campo, mensagem) {
    setErros((atual) => ({ ...atual, [campo]: mensagem || undefined }));
  }

  function focarPrimeiro(lista) {
    const primeiro = ORDEM_CAMPOS.find((c) => lista[c]);
    if (primeiro) document.getElementById(primeiro)?.focus();
  }

  async function enviar(evento) {
    evento.preventDefault();
    if (enviando) return;
    setErroGeral("");
    const locais = validarInscricao({ ...form, arquivo });
    if (Object.keys(locais).length) {
      setErros(locais);
      focarPrimeiro(locais);
      return;
    }

    setEnviando(true);
    try {
      let arquivo_uri, arquivo_nome, arquivo_tamanho;
      if (arquivo) {
        const up = await base44.integrations.Core.UploadPrivateFile({ file: arquivo });
        arquivo_uri = up.file_uri;
        arquivo_nome = arquivo.name;
        arquivo_tamanho = arquivo.size;
      }

      const resposta = await criar({
        data: {
          tipo: form.tipo,
          nome: form.nome.trim(),
          coautores: (form.coautores ?? []).map((n) => n.trim()).filter(Boolean),
          email: form.email.trim(),
          telefone: form.telefone,
          cpf: form.cpf,
          matricula: form.matricula,
          instituicao: form.instituicao.trim(),
          curso: form.curso === OUTROS ? form.curso_outro.trim() : form.curso,
          disciplina: form.tipo === "externo" ? "" : form.disciplina,
          formato: form.formato,
          titulo: form.titulo,
          resumo: form.resumo,
          aceite: form.aceite,
          arquivo_uri,
          arquivo_nome,
          arquivo_tamanho,
        },
      });

      if (!resposta.ok) {
        if (resposta.erros && Object.keys(resposta.erros).length) {
          setErros(resposta.erros);
          focarPrimeiro(resposta.erros);
        }
        if (resposta.erro) setErroGeral(resposta.erro);
        return;
      }
      setResultado(resposta.participante);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErroGeral("Não foi possível concluir a inscrição. Verifique sua internet e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  function novaInscricao() {
    setForm(VAZIO);
    setArquivo(null);
    setErros({});
    setResultado(null);
  }

  if (resultado) {
    return (
      <div className="jr-card border-t-[5px] border-amarelo p-5 sm:p-9">
        <PainelSucesso resultado={resultado} onNova={novaInscricao} />
      </div>
    );
  }

  return (
      <CartaoFaixa
        Icone={Send}
        titulo="Submissão de trabalho"
        descricao="Preencha as 4 etapas abaixo e envie a sua inscrição."
        corpoClassName="p-5 sm:p-8"
      >
        <form onSubmit={enviar} noValidate>
          <p id="rotulo-tipo" className="m-0 mb-2 text-[0.75rem] font-bold uppercase tracking-[0.12em] text-navy">
            Você é:
          </p>
          <div className="mb-8">
            <TipoSeletor
              rotuloId="rotulo-tipo"
              rotulo="Você é aluno ou público externo?"
              opcoes={TIPOS}
              valor={form.tipo}
              onMudar={(v) => {
                if (v === form.tipo) return;
                setCampo("tipo", v);
                // Disciplina só vale para alunos da instituição; ao trocar, o formato é escolhido de novo.
                setCampo("disciplina", "");
                setCampo("formato", "");
              }}
            />
          </div>

          {!aberta && motivo && (
            <div className="jr-alerta jr-alerta-erro mb-6" role="alert">
              {motivo}
            </div>
          )}

          {erroGeral && (
            <div className="jr-alerta jr-alerta-erro mb-6" role="alert">
              {erroGeral}
            </div>
          )}

          <Secao numero={1} titulo="Trabalho" descricao="Título, curso, formato, resumo e arquivo.">
            <DadosTrabalho
              form={form}
              setCampo={setCampo}
              erros={erros}
              arquivo={arquivo}
              setArquivo={setArquivo}
              setErro={setErro}
            />
          </Secao>

          <Secao
            numero={2}
            titulo="Seus dados"
            descricao="Quem vai apresentar o trabalho. Já se inscreveu como participante? Use o mesmo CPF e e-mail: a inscrição vira submissão."
          >
            <DadosPessoais form={form} setCampo={setCampo} erros={erros} />
          </Secao>

          <Secao numero={3} titulo="Coautores" descricao="Opcional.">
            <Coautores
              coautores={form.coautores ?? []}
              setCoautores={(lista) => setCampo("coautores", lista)}
              erro={erros.coautores}
            />
          </Secao>

          <Secao numero={4} titulo="Confirmação" descricao="Revise e envie.">
            <label className="flex cursor-pointer items-start gap-3 text-[0.95rem]">
              <input
                type="checkbox"
                checked={form.aceite}
                onChange={(e) => setCampo("aceite", e.target.checked)}
                className="mt-1 h-5 w-5 flex-none accent-[#0040ce]"
              />
              <span>
                Li e concordo com o uso dos meus dados somente para a inscrição, o controle de presença
                e a emissão do certificado da VI Jornada Acadêmica.
              </span>
            </label>
            {erros.aceite && (
              <p className="jr-erro" role="alert">
                {erros.aceite}
              </p>
            )}

            <div className="mt-5 rounded-lg border border-[#f3d27a] bg-[#fff6d9] px-4 py-3 text-[0.95rem] text-[#5c4300]">
              <strong>Doação solidária:</strong> cada aluno participante é convidado a levar 1 kg de
              alimento não perecível no credenciamento. Tudo será doado a uma instituição de trabalho
              social reconhecida.
            </div>
          </Secao>

          <button
            type="submit"
            disabled={enviando || !aberta}
            className="mt-6 inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-lg bg-amarelo px-6 py-3 text-[1.05rem] font-bold text-navy transition hover:-translate-y-0.5 hover:bg-[#e8b800] disabled:cursor-not-allowed disabled:bg-[#e3e8f4] disabled:text-[#3f4a6b] disabled:hover:translate-y-0"
          >
            {enviando ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-5 w-5" aria-hidden="true" />
            )}
            {enviando ? "Enviando..." : "Enviar inscrição"}
          </button>

          <p className="mt-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 no-underline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar para a página inicial
            </Link>
          </p>
        </form>
      </CartaoFaixa>
  );
}
