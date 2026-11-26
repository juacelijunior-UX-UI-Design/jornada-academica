import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Loader2, LogIn, LogOut, Mail, ScanLine, ShieldCheck, UserPlus, XCircle } from "lucide-react";
import CheckinPainel from "@/components/checkin/CheckinPainel";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { useAuth } from "@/lib/AuthContext";
import { signInWithProvider } from "@/lib/authMfaFlow";
import { minhaSituacaoCheckin } from "@/lib/fn-checkin";

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
        Área restrita à equipe de monitores aprovada pela organização, que registra a presença dos inscritos pelo QR
        Code. Entre com o <strong>mesmo e-mail</strong> usado na inscrição de monitor.
      </p>
      <p className="mt-3 rounded-lg bg-fundo px-4 py-3 text-[0.92rem] text-tinta">
        Ainda não é monitor?{" "}
        <Link to="/monitores" className="font-semibold">
          Faça sua inscrição na equipe
        </Link>
        .
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
        Sem inscrição aprovada, o leitor de QR Code não é liberado.
      </p>
    </Cartao>
  );
}

// 2) Logado, mas o e-mail ainda não está na equipe: orienta a fazer a inscrição de monitor.
function SemAcesso({ situacao }) {
  const recusado = situacao.pedido?.status === "recusada";
  const removido = situacao.pedido?.status === "aprovada";
  return (
    <Cartao>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-fundo">
        <ShieldCheck className="h-6 w-6 text-royal" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-heading text-[1.35rem] font-extrabold text-navy">Você ainda não está na equipe</h2>
      <p className="mt-2 text-tinta-suave">
        O e-mail <strong className="break-all text-tinta">{situacao.email}</strong> não tem acesso ao check-in. Para fazer
        parte da equipe de monitores, faça a sua inscrição com <strong>este mesmo e-mail</strong>. Depois que a
        organização aprovar, é só voltar a esta página.
      </p>

      {recusado && (
        <div className="jr-alerta jr-alerta-erro mt-5" role="status">
          <XCircle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <span>Sua inscrição anterior foi recusada. Se achar que foi engano, fale com a organização.</span>
        </div>
      )}
      {removido && (
        <div className="jr-alerta jr-alerta-info mt-5" role="status">
          <span>Seu acesso ao check-in foi retirado pelo administrador. Fale com a organização ou inscreva-se de novo.</span>
        </div>
      )}

      <Link
        to="/monitores"
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-amarelo px-6 font-bold text-navy no-underline transition hover:bg-[#e8b800]"
      >
        <UserPlus className="h-5 w-5" aria-hidden="true" />
        Fazer inscrição de monitor
      </Link>
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
      <h2 className="mt-4 font-heading text-[1.35rem] font-extrabold text-navy">Inscrição de monitor recebida!</h2>
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
        {situacao.pedido.matricula && (
          <div className="flex justify-between gap-3 py-2">
            <dt className="font-semibold text-tinta-suave">Matrícula:</dt>
            <dd className="text-right">{situacao.pedido.matricula}</dd>
          </div>
        )}
        {situacao.pedido.curso && (
          <div className="flex justify-between gap-3 py-2">
            <dt className="font-semibold text-tinta-suave">Curso:</dt>
            <dd className="text-right">{situacao.pedido.curso}</dd>
          </div>
        )}
        {situacao.pedido.cpf && (
          <div className="flex justify-between gap-3 py-2">
            <dt className="font-semibold text-tinta-suave">CPF:</dt>
            <dd className="text-right">{situacao.pedido.cpf}</dd>
          </div>
        )}
      </dl>
    </Cartao>
  );
}

// Página /checkin: decide o que mostrar conforme o login e a liberação.
export default function AcessoCheckin() {
  const { user, isLoadingAuth, logout } = useAuth();
  const buscar = useServerFn(minhaSituacaoCheckin);
  const { data, isLoading, isError } = useQuery({
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
      <SemAcesso situacao={data} />
    </>
  );
}
