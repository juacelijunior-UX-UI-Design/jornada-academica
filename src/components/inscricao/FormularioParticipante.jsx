import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, QrCode, ShoppingBasket, UserCheck } from "lucide-react";
import Campo from "@/components/inscricao/Campo";
import IngressoCard from "@/components/ingresso/IngressoCard";
import { CARGA_HORARIA_PARTICIPANTE } from "@/lib/evento";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { useAuth } from "@/lib/AuthContext";
import { signInWithProvider } from "@/lib/authMfaFlow";
import { criarParticipacao } from "@/lib/fn-inscricao";
import { mascaraCpf, mascaraTelefone, validarParticipante } from "@/lib/validacao";
import CartaoFaixa from "@/components/painel/CartaoFaixa";

const ORDEM = ["nome", "cpf", "telefone", "email"];

// Aba "Participante": inscrição de quem vai assistir às apresentações (sem trabalho).
// Com a conta Google, nome e e-mail já vêm preenchidos.
export default function FormularioParticipante() {
  const criar = useServerFn(criarParticipacao);
  const { user, isLoadingAuth } = useAuth();
  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "", email: "", aceite: false });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const comGoogle = !isLoadingAuth && Boolean(user?.email);
  // Com a conta conectada, nome e e-mail vêm dela (o nome ainda pode ser corrigido).
  const valores = comGoogle
    ? { ...form, nome: form.nome || user.full_name || "", email: user.email }
    : form;

  function setCampo(campo, valor) {
    setForm((a) => ({ ...a, [campo]: valor }));
    setErros((a) => ({ ...a, [campo]: undefined }));
  }

  function entrarComGoogle() {
    setErroGeral("");
    signInWithProvider("google", "/inscricao?aba=participante").catch((err) =>
      setErroGeral(err?.message || "Não foi possível entrar com o Google. Preencha os campos abaixo.")
    );
  }

  async function enviar(e) {
    e.preventDefault();
    if (enviando) return;
    setErroGeral("");
    const locais = validarParticipante(valores);
    if (Object.keys(locais).length) {
      setErros(locais);
      const primeiro = ORDEM.find((c) => locais[c]);
      if (primeiro) document.getElementById(`p-${primeiro}`)?.focus();
      return;
    }
    setEnviando(true);
    try {
      const res = await criar({ data: valores });
      if (!res?.ok) {
        if (res?.erros) setErros(res.erros);
        if (res?.erro) setErroGeral(res.erro);
        return;
      }
      setResultado(res.participante);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErroGeral("Não foi possível concluir a inscrição. Verifique sua internet e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    return (
      <div className="jr-card border-t-[5px] border-amarelo p-5 sm:p-9">
        <div className="jr-alerta jr-alerta-sucesso mb-4" role="status">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <span>
            Inscrição confirmada, {String(resultado.nome).split(" ")[0]}! Guarde o QR Code abaixo: ele é o seu
            ingresso.
          </span>
        </div>

        {resultado.qr && (
          <div className="my-6 rounded-xl bg-fundo p-4 sm:p-6">
            <IngressoCard ingresso={{ nome: resultado.nome, cpf: resultado.cpf, qr: resultado.qr, tipo: "participante" }} />
          </div>
        )}

        <div className="jr-alerta jr-alerta-info mb-4">
          <QrCode className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <span>
            {resultado.email_enviado
              ? "Também enviamos o QR Code para o seu e-mail. "
              : "Não conseguimos enviar o e-mail agora, mas você pode baixar o QR Code acima. "}
            Se perder, ele fica em <Link to="/minha-inscricao">Minha inscrição</Link>, entrando com o mesmo
            e-mail. Com a presença registrada, você recebe o certificado de {CARGA_HORARIA_PARTICIPANTE} horas.
          </span>
        </div>
        <div className="jr-alerta jr-alerta-info">
          <ShoppingBasket className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <span>
            Leve <strong>1 kg de alimento não perecível</strong> para o credenciamento.
          </span>
        </div>
      </div>
    );
  }

  const props = (id) => ({
    id: `p-${id}`,
    className: "jr-input",
    value: valores[id],
    "aria-invalid": erros[id] ? "true" : undefined,
    onChange: (e) => setCampo(id, e.target.value),
  });

  return (
    <CartaoFaixa
      Icone={UserPlus}
      titulo="Inscrição de participante"
      descricao="Para quem vai assistir às apresentações."
      corpoClassName="p-5 sm:p-8"
    >
      <p className="m-0 text-[0.95rem] text-tinta">
        Você recebe o QR Code de ingresso na hora e, com a presença registrada no evento, o certificado de{" "}
        <strong>{CARGA_HORARIA_PARTICIPANTE} horas</strong>.
      </p>

      {erroGeral && (
        <div className="jr-alerta jr-alerta-erro mt-5" role="alert">
          {erroGeral}
        </div>
      )}

      {comGoogle ? (
        <p className="mt-6 rounded-lg bg-fundo px-4 py-3 text-[0.95rem] text-tinta">
          Conta Google conectada: <strong className="break-all">{user.email}</strong>
        </p>
      ) : (
        <div className="mt-6">
          <button
            type="button"
            onClick={entrarComGoogle}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-linea bg-white px-4 font-semibold text-tinta transition hover:border-royal hover:bg-fundo"
          >
            <GoogleIcon className="h-5 w-5" />
            Inscrever-se com o Google
          </button>
          <p className="mt-2 text-center text-[0.85rem] text-tinta-suave">
            Com a conta Google, seu nome e e-mail já vêm preenchidos.
          </p>
          <div className="my-6 flex items-center gap-3 text-[0.8rem] font-semibold uppercase tracking-wide text-tinta-suave">
            <span className="h-px flex-1 bg-linea" aria-hidden="true" />
            ou preencha
            <span className="h-px flex-1 bg-linea" aria-hidden="true" />
          </div>
        </div>
      )}

      <form onSubmit={enviar} noValidate className={comGoogle ? "mt-6" : ""}>
        <Campo id="p-nome" label="Nome completo" erro={erros.nome}>
          <input {...props("nome")} type="text" autoComplete="name" maxLength={150} />
        </Campo>

        <div className="grid gap-x-4 sm:grid-cols-2">
          <Campo id="p-cpf" label="CPF" erro={erros.cpf}>
            <input
              {...props("cpf")}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              onChange={(e) => setCampo("cpf", mascaraCpf(e.target.value))}
            />
          </Campo>
          <Campo id="p-telefone" label="Telefone" erro={erros.telefone}>
            <input
              {...props("telefone")}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(99) 99999-9999"
              onChange={(e) => setCampo("telefone", mascaraTelefone(e.target.value))}
            />
          </Campo>
        </div>

        <Campo id="p-email" label="E-mail" erro={erros.email}>
          <input
            {...props("email")}
            type="email"
            autoComplete="email"
            maxLength={150}
            readOnly={comGoogle}
            className={`jr-input ${comGoogle ? "bg-fundo text-tinta-suave" : ""}`}
          />
        </Campo>

        <label className="mt-2 flex cursor-pointer items-start gap-3 text-[0.95rem]">
          <input
            type="checkbox"
            checked={form.aceite}
            onChange={(e) => setCampo("aceite", e.target.checked)}
            className="mt-1 h-5 w-5 flex-none accent-[#0040ce]"
          />
          <span>
            Autorizo o uso dos meus dados somente para a inscrição, o controle de presença e a emissão do
            certificado da VI Jornada Acadêmica.
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
          {enviando ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <UserCheck className="h-5 w-5" aria-hidden="true" />
          )}
          {enviando ? "Enviando..." : "Inscrever-me"}
        </button>
      </form>
    </CartaoFaixa>
  );
}
