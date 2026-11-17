import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { criarInscricao } from "@/lib/fn-inscricao";
import { OUTROS } from "@/lib/evento";
import { validarInscricao } from "@/lib/validacao";
import DadosPessoais from "@/components/inscricao/DadosPessoais";
import DadosTrabalho from "@/components/inscricao/DadosTrabalho";
import PainelSucesso from "@/components/inscricao/PainelSucesso";

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
  resumo: "",
  aceite: false,
};

const ORDEM_CAMPOS = ["nome", "email", "telefone", "cpf", "matricula", "instituicao", "curso", "curso_outro", "disciplina", "formato", "resumo", "arquivo"];

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
          disciplina: form.disciplina,
          formato: form.formato,
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

  if (resultado) return <PainelSucesso resultado={resultado} onNova={novaInscricao} />;

  return (
    <form onSubmit={enviar} noValidate>
      <p className="jr-legenda mb-5">
        Preencha os dados abaixo. Todos os campos são obrigatórios.
      </p>

      {!aberta && motivo && (
        <div className="jr-alerta jr-alerta-erro mb-5" role="alert">
          {motivo}
        </div>
      )}

      {erroGeral && (
        <div className="jr-alerta jr-alerta-erro mb-5" role="alert">
          {erroGeral}
        </div>
      )}

      <DadosPessoais form={form} setCampo={setCampo} erros={erros} />
      <DadosTrabalho
        form={form}
        setCampo={setCampo}
        erros={erros}
        arquivo={arquivo}
        setArquivo={setArquivo}
        setErro={setErro}
      />

      <button
        type="submit"
        disabled={enviando || !aberta}
        className="mt-2 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-amarelo px-6 py-3 font-semibold text-navy transition hover:bg-[#e8b800] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#e3e8f4] disabled:text-[#3f4a6b] disabled:hover:translate-y-0"
      >
        {enviando && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
        {enviando ? "Enviando..." : "Confirmar inscrição"}
      </button>

      <p className="mt-4 text-center">
        <Link to="/" className="inline-flex items-center gap-2 no-underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Voltar para a página inicial
        </Link>
      </p>
    </form>
  );
}