import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./GoogleIcon";
import { signInWithProvider } from "@/lib/authMfaFlow";
import { returnToSearch } from "@/lib/authReturnTo";

// Small pieces the auth pages share.

// Mensagens comuns do servidor (em inglês) traduzidas para o português.
const TRADUCOES = [
  [/invalid (email|credentials)|incorrect (email|password)|wrong password|invalid password/i, "E-mail ou senha inválidos."],
  [/user (not found|does not exist)/i, "Não encontramos uma conta com esse e-mail."],
  [/already (exists|registered)|email.*(taken|in use)/i, "Já existe uma conta com esse e-mail. Tente entrar."],
  [/not verified|verify your email/i, "Confirme o seu e-mail antes de entrar."],
  [/invalid.*(code|otp)|code.*(invalid|expired)/i, "Código inválido ou expirado."],
  [/password.*(short|at least|weak|characters)/i, "A senha é muito curta ou fraca. Use pelo menos 8 caracteres."],
  [/too many|rate limit/i, "Muitas tentativas. Aguarde alguns minutos e tente de novo."],
  [/network|failed to fetch/i, "Sem conexão com o servidor. Verifique a internet e tente de novo."],
];

export function traduzirErro(mensagem) {
  if (typeof mensagem !== "string") return mensagem;
  const achada = TRADUCOES.find(([padrao]) => padrao.test(mensagem));
  return achada ? achada[1] : mensagem;
}

export function AuthError({ children }) {
  if (!children) return null;
  const mensagem = traduzirErro(children);
  return (
    <div role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      {mensagem}
    </div>
  );
}

export function SubmitButton({ busy, busyLabel, children, ...props }) {
  return (
    <Button type="submit" className="h-12 w-full font-medium" disabled={busy} {...props}>
      {busy ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function GoogleButton({ returnTo, onError }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="mb-6 h-12 w-full text-sm font-medium"
      onClick={() => signInWithProvider("google", returnTo).catch((err) => onError(err.message || "Não foi possível entrar com o Google."))}
    >
      <GoogleIcon className="mr-2 h-5 w-5" />
      Continuar com o Google
    </Button>
  );
}

export function OrDivider() {
  return (
    <div className="relative mb-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-3 text-muted-foreground">ou</span>
      </div>
    </div>
  );
}

// A link between auth screens that carries the way back (?returnTo=) along.
export function AuthLink({ to, returnTo, className = "font-medium text-primary hover:underline", children }) {
  return (
    <Link to={to} search={returnToSearch(returnTo)} className={className}>
      {children}
    </Link>
  );
}
