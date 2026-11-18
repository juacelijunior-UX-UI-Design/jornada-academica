import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Loader2, LogIn, LogOut, Mail, ScanLine, ShieldCheck, UserPlus, XCircle } from "lucide-react";
import Campo from "@/components/inscricao/Campo";
import CheckinPainel from "@/components/checkin/CheckinPainel";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { useAuth } from "@/lib/AuthContext";
import { signInWithProvider } from "@/lib/authMfaFlow";
import { minhaSituacaoCheckin, solicitarAcessoCheckin } from "@/lib/fn-checkin";
import { mascaraCpf } from "@/lib/validacao";

const VOLTA = "/checkin";

function Cartao({ children, className = "" }) {
  return <div className={`jr-card mx-auto max-w-xl p-6 sm:p-8 ${className}`}>{children}</div>;
}

// 1) Sem login: entrar com o Google ou com e-mail e senha.
function Entrar() {
  const [erro, setErro] = useState("");
  return (
    <Cartao>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-fundo">
        <ShieldCheck className="h-6 w-6 text-royal" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-heading text-[1.35rem] font-extrabold text-navy">Equipe de check-in</h2>
      <p className="mt-2 text-tinta-suave">
        Área restrita a quem registra a presença dos inscritos pelo QR Code. Entre com a sua conta e peça acesso:
        o administrador do evento libera o check-in para você.
      </p>

      {erro && (
        <div className="jr-alerta jr-alerta-erro mt-5" role="alert">
          {erro}
        </div>
      )}

      <button
        type="button"
        onClick={() =>
          signInWithProvider("google", VOLTA).catch((e) => setErro(e?.message || "Não foi possível entrar com o Google."))
        }
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-lg border-[1.5px] border-linea bg-white px-4 font-semibold text-tinta transition hover:border-royal hover:bg-fundo"
      >
        <GoogleIcon className="h-5 w-5" />
        Entrar com o Google
      </button>

      <div className="my-5 flex items-center gap-3 text-[0.8rem] font-semibold uppercase tracking-wide text-tinta-suave">
        <span className="h-px flex-1 bg-linea" aria-hidden="true" />
        ou com e-mail
        <span className="h-px flex-1 bg-linea" aria-hidden="true" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Link
          to="/register"
          search={{ returnTo: VOLTA }}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-navy px-4 font-semibold text-white no-underline transition hover:bg-royal"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          Criar conta
        </Link>
        <Link
          to="/login"
          search={{ returnTo: VOLTA }}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 border-navy px-4 font-semibold text-navy no-underline transition hover:bg-navy hover:text-white"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Já tenho conta
        </Link>
      </div>
      <p className="mt-3 text-center text-[0.85rem] text-tinta-suave">
        Depois de entrar, você informa nome e CPF para pedir o acesso.
      </p>
    </Cartao>
  );
}

// 2) Logado, sem acesso: formulário de pedido (nome, e-mail da conta e CPF).
function Pedido({ situacao, onEnviado }) {
  const enviar = useServerFn(solicitarAcessoCheckin);
  const [form, setForm] = useState({ nome: situacao.nome || "", cpf: "", aceite: false });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const recusado = situacao.pedido?.status === "recusada";
  const removido = situacao.pedido?.status === "aprovada";

  const setCampo = (c, v) => {
    setForm((a) => ({ ...a, [c]: v }));
    setErros((a) => ({ ...a, [c]: undefined }));
  };

  async function submeter(e) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);
    try {
      const res = await enviar({ data: form });
      if (!res?.ok) {
        setErros(res?.erros || {});
        return;
      }
      await onEnviado();
    } catch {
      setErros({ geral: "Não foi possível enviar. Tente novamente." });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Cartao>
      <h2 className="font-heading text-[1.35rem] font-extrabold text-navy">Pedir acesso ao check-in</h2>
      <p className="mt-2 text-tinta-suave">
        Preencha seus dados. O administrador do evento recebe o pedido e libera o acesso.
      </p>

      {recusado && (
        <div className="jr-alerta jr-alerta-erro mt-5" role="status">
          <XCircle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <span>Seu pedido anterior foi recusado. Se achar que foi engano, envie de novo ou fale com a organização.</span>
        </div>
      )}
      {removido && (
        <div className="jr-alerta jr-alerta-info mt-5" role="status">
          <span>Seu acesso ao check-in foi retirado pelo administrador. Você pode pedir de novo.</span>
        </div>
      )}
      {erros.geral && (
        <div className="jr-alerta jr-alerta-erro mt-5" role="alert">
          {erros.geral}
        </div>
      )}

      <form onSubmit={submeter} noValidate className="mt-6">
        <Campo id="c-nome" label="Nome completo" erro={erros.nome}>
          <input
            id="c-nome"
            className="jr-input"
            autoComplete="name"
            maxLength={150}
            value={form.nome}
            aria-invalid={erros.nome ? "true" : undefined}
            onChange={(e) => setCampo("nome", e.target.value)}
          />
        </Campo>
        <div className="grid gap-x-4 sm:grid-cols-2">
          <Campo id="c-email" label="E-mail (da sua conta)">
            <input id="c-email" className="jr-input bg-fundo text-tinta-suave" value={situacao.email} readOnly />
          </Campo>
          <Campo id="c-cpf" label="CPF" erro={erros.cpf}>
            <input
              id="c-cpf"
              className="jr-input"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              value={form.cpf}
              aria-invalid={erros.cpf ? "true" : undefined}
              onChange={(e) => setCampo("cpf", mascaraCpf(e.target.value))}
            />
          </Campo>
        </div>

        <label className="mt-1 flex cursor-pointer items-start gap-3 text-[0.95rem]">
          <input
            type="checkbox"
            checked={form.aceite}
            onChange={(e) => setCampo("aceite", e.target.checked)}
            className="mt-1 h-5 w-5 flex-none accent-[#0040ce]"
          />
          <span>Autorizo o uso dos meus dados para identificar quem registra as presenças no evento.</span>
        </label>
        {erros.aceite && (
          <p className="jr-erro" role="alert">
            {erros.aceite}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-amarelo px-6 font-bold text-navy transition hover:bg-[#e8b800] disabled:opacity-60"
        >
          {enviando ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-5 w-5" aria-hidden="true" />}
          {enviando ? "Enviando..." : "Pedir acesso"}
        </button>
      </form>
    </Cartao>
  );
}

// 3) Pedido enviado, aguardando o administrador.
function Aguardando({ situacao }) {
  return (
    <Cartao className="text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff6d9]">
        <Clock className="h-7 w-7 text-[#8a6500]" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-heading text-[1.35rem] font-extrabold text-navy">Pedido enviado!</h2>
      <p className="mt-2 text-tinta-suave">
        Aguarde a aprovação do administrador do evento. Assim que o acesso for liberado, esta página abre o leitor
        de QR Code (é só recarregar).
      </p>
      <dl className="mx-auto mt-5 max-w-sm divide-y divide-linea rounded-lg border border-linea px-4 py-1 text-left text-[0.95rem]">
        <div className="flex justify-between gap-3 py-2">
          <dt className="font-semibold text-tinta-suave">Nome:</dt>
          <dd className="text-right">{situacao.pedido.nome}</dd>
        </div>
        <div className="flex justify-between gap-3 py-2">
          <dt className="font-semibold text-tinta-suave">E-mail:</dt>
          <dd className="break-all text-right">{situacao.email}</dd>
        </div>
        <div className="flex justify-between gap-3 py-2">
          <dt className="font-semibold text-tinta-suave">CPF:</dt>
          <dd className="text-right">{situacao.pedido.cpf}</dd>
        </div>
      </dl>
    </Cartao>
  );
}

// Página /checkin: decide o que mostrar conforme o login e a liberação.
export default function AcessoCheckin() {
  const { user, isLoadingAuth, logout } = useAuth();
  const buscar = useServerFn(minhaSituacaoCheckin);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["situacao-checkin", user?.email],
    queryFn: () => buscar(),
    enabled: !isLoadingAuth && Boolean(user),
  });

  if (isLoadingAuth || (user && isLoading)) {
    return (
      <p className="jr-card mx-auto flex max-w-xl items-center gap-3 p-6 text-tinta-suave">
        <Loader2 className="h-5 w-5 animate-spin text-royal" aria-hidden="true" />
        Carregando…
      </p>
    );
  }
  if (!user) return <Entrar />;
  if (isError || !data) {
    return (
      <div className="jr-alerta jr-alerta-erro mx-auto max-w-xl" role="alert">
        Não foi possível verificar o seu acesso. Recarregue a página.
      </div>
    );
  }

  const barraConta = (
    <p className="mx-auto mb-4 flex max-w-xl flex-wrap items-center justify-between gap-2 text-[0.9rem] text-tinta-suave">
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <Mail className="h-4 w-4 flex-none" aria-hidden="true" />
        <span className="truncate">{data.email}</span>
      </span>
      <button type="button" onClick={() => logout()} className="inline-flex items-center gap-1.5 font-semibold text-royal hover:underline">
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sair desta conta
      </button>
    </p>
  );

  if (data.liberado) {
    return (
      <div>
        <div className="mb-5 flex items-center gap-2 text-[0.95rem] font-semibold text-[#166b3b]">
          <ScanLine className="h-5 w-5" aria-hidden="true" />
          Acesso liberado · {data.email}
        </div>
        <CheckinPainel />
      </div>
    );
  }

  if (data.pedido?.status === "pendente") {
    return (
      <>
        {barraConta}
        <Aguardando situacao={data} />
      </>
    );
  }

  return (
    <>
      {barraConta}
      <Pedido situacao={data} onEnviado={refetch} />
    </>
  );
}
