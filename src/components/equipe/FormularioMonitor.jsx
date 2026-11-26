import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Info, Loader2, ScanLine, Send, UserPlus } from "lucide-react";
import Campo from "@/components/inscricao/Campo";
import CartaoFaixa from "@/components/painel/CartaoFaixa";
import { inscreverMonitor } from "@/lib/fn-checkin";
import { CURSOS, OUTROS } from "@/lib/evento";

const VAZIO = { nome: "", email: "", matricula: "", curso: "", curso_outro: "", aceite: false };
const ORDEM = ["nome", "email", "matricula", "curso"];

// Formulário da página "Seja monitor": nome, e-mail, matrícula e curso na UNINASSAU.
export default function FormularioMonitor() {
  const enviar = useServerFn(inscreverMonitor);
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const setCampo = (campo, valor) => {
    setForm((a) => ({ ...a, [campo]: valor }));
    setErros((a) => ({ ...a, [campo]: undefined }));
  };

  function validarLocal() {
    const e = {};
    const nome = form.nome.trim().replace(/\s+/g, " ");
    if (nome.split(" ").filter(Boolean).length < 2) e.nome = "Informe nome e sobrenome.";
    else if (/\d/.test(nome)) e.nome = "O nome não pode ter números.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "E-mail inválido.";
    if (form.matricula.replace(/\D/g, "").length < 4) e.matricula = "Informe a sua matrícula (somente números).";
    if (!form.curso) e.curso = "Selecione o seu curso.";
    else if (form.curso === OUTROS && form.curso_outro.trim().length < 3) e.curso_outro = "Informe o nome do curso.";
    if (!form.aceite) e.aceite = "Aceite o uso dos dados para continuar.";
    return e;
  }

  async function submeter(evento) {
    evento.preventDefault();
    if (enviando) return;
    setErroGeral("");
    const locais = validarLocal();
    if (Object.keys(locais).length) {
      setErros(locais);
      const primeiro = [...ORDEM, "curso_outro"].find((c) => locais[c]);
      if (primeiro) document.getElementById(`m-${primeiro}`)?.focus();
      return;
    }
    setEnviando(true);
    try {
      const res = await enviar({
        data: {
          nome: form.nome,
          email: form.email,
          matricula: form.matricula,
          curso: form.curso === OUTROS ? form.curso_outro.trim() : form.curso,
          aceite: form.aceite,
        },
      });
      if (!res?.ok) {
        setErros(res?.erros || {});
        if (!res?.erros) setErroGeral("Não foi possível enviar. Tente novamente.");
        return;
      }
      setResultado({ situacao: res.situacao, nome: form.nome.trim(), email: form.email.trim().toLowerCase() });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErroGeral("Não foi possível enviar. Verifique sua internet e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    const jaEquipe = resultado.situacao === "ja_equipe";
    return (
      <CartaoFaixa Icone={CheckCircle2} titulo={jaEquipe ? "Você já faz parte da equipe" : "Inscrição recebida!"}>
        <div className={`jr-alerta ${jaEquipe ? "jr-alerta-info" : "jr-alerta-sucesso"}`} role="status">
          {jaEquipe ? (
            <Info className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          )}
          <span>
            {jaEquipe ? (
              <>
                O e-mail <strong className="break-all">{resultado.email}</strong> já tem acesso como membro da equipe. Não é
                preciso se inscrever de novo.
              </>
            ) : (
              <>
                Obrigado, {resultado.nome.split(" ")[0]}!{" "}
                {resultado.situacao === "atualizada"
                  ? "Seus dados foram atualizados na inscrição que já estava aguardando aprovação."
                  : "Sua inscrição na equipe de monitores foi enviada para a organização."}
              </>
            )}
          </span>
        </div>

        {!jaEquipe && (
          <ol className="m-0 mt-5 list-none space-y-3 p-0 text-[0.95rem]">
            <li className="flex items-start gap-3">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-navy text-[0.8rem] font-bold text-amarelo">1</span>
              <span>A organização analisa e aprova a sua inscrição.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-navy text-[0.8rem] font-bold text-amarelo">2</span>
              <span>
                No dia do evento, abra a página <strong>Check-in</strong> e entre com o e-mail{" "}
                <strong className="break-all">{resultado.email}</strong> (pelo Google ou criando uma senha).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-navy text-[0.8rem] font-bold text-amarelo">3</span>
              <span>Com a inscrição aprovada, o leitor de QR Code já aparece para você registrar as presenças.</span>
            </li>
          </ol>
        )}

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <Link
            to="/checkin"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-royal px-4 font-semibold text-white no-underline hover:bg-navy"
          >
            <ScanLine className="h-4 w-4" aria-hidden="true" />
            Ir para o Check-in
          </Link>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border-2 border-navy px-4 font-semibold text-navy no-underline hover:bg-navy hover:text-white"
          >
            Voltar ao início
          </Link>
        </div>
      </CartaoFaixa>
    );
  }

  const props = (id) => ({
    id: `m-${id}`,
    className: "jr-input",
    value: form[id],
    "aria-invalid": erros[id] ? "true" : undefined,
    onChange: (e) => setCampo(id, e.target.value),
  });

  return (
    <CartaoFaixa
      Icone={UserPlus}
      titulo="Inscrição na equipe de monitores"
      descricao="Para alunos da UNINASSAU que querem trabalhar no evento."
      corpoClassName="p-5 sm:p-8"
    >
      {erroGeral && (
        <div className="jr-alerta jr-alerta-erro mb-5" role="alert">
          {erroGeral}
        </div>
      )}

      <form onSubmit={submeter} noValidate>
        <Campo id="m-nome" label="Nome completo" erro={erros.nome}>
          <input {...props("nome")} type="text" autoComplete="name" maxLength={150} />
        </Campo>

        <Campo
          id="m-email"
          label="E-mail"
          erro={erros.email}
          ajuda="Use o e-mail com que você vai entrar no sistema no dia do evento."
        >
          <input {...props("email")} type="email" autoComplete="email" maxLength={150} placeholder="voce@exemplo.com" />
        </Campo>

        <div className="grid gap-x-4 sm:grid-cols-2">
          <Campo id="m-matricula" label="Matrícula" erro={erros.matricula}>
            <input
              {...props("matricula")}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={20}
              placeholder="Somente números"
              onChange={(e) => setCampo("matricula", e.target.value.replace(/\D/g, ""))}
            />
          </Campo>
          <Campo id="m-curso" label="Curso na UNINASSAU" erro={erros.curso}>
            <select {...props("curso")}>
              <option value="">Selecione o curso</option>
              {CURSOS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={OUTROS}>Outro curso</option>
            </select>
          </Campo>
        </div>

        {form.curso === OUTROS && (
          <Campo id="m-curso_outro" label="Nome do curso" erro={erros.curso_outro}>
            <input {...props("curso_outro")} type="text" maxLength={100} />
          </Campo>
        )}

        <label className="mt-1 flex cursor-pointer items-start gap-3 text-[0.95rem]">
          <input
            type="checkbox"
            checked={form.aceite}
            onChange={(e) => setCampo("aceite", e.target.checked)}
            className="mt-1 h-5 w-5 flex-none accent-[#0040ce]"
          />
          <span>
            Autorizo o uso dos meus dados somente para a organização da equipe de trabalho da VI Jornada Acadêmica.
          </span>
        </label>
        {erros.aceite && (
          <p className="jr-erro" role="alert">
            {erros.aceite}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-lg bg-amarelo px-6 py-3 text-[1.05rem] font-bold text-navy transition hover:-translate-y-0.5 hover:bg-[#e8b800] disabled:cursor-not-allowed disabled:bg-[#e3e8f4] disabled:text-[#3f4a6b] disabled:hover:translate-y-0"
        >
          {enviando ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
          {enviando ? "Enviando..." : "Enviar inscrição"}
        </button>
      </form>
    </CartaoFaixa>
  );
}
