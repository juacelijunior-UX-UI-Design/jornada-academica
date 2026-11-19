import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MfaMethodSetup } from "@/components/auth/MfaMethodSetup";
import { CodeField, MfaHeader, MfaNotice, RememberDevice, ResendLine, useAppInfo, useCooldown } from "@/components/auth/MfaParts";
import { finishSignIn, mfaSession } from "@/lib/authMfaFlow";

const SMS_RESEND_SECONDS = 60;

// The second sign-in step, for a sign-in that returned mfa_required. It is card content: a page
// shows it with `return <MfaScreen><MfaFlow ... /></MfaScreen>` in place of its own layout.
// session-record-block keeps the QR code, setup key and codes out of session recordings.
// onManage(session) is called instead of finishing when the sign-in was for managing factors.
export function MfaFlow({ challenge, returnTo, onManage }) {
  const session = useMemo(() => mfaSession(challenge), [challenge]);
  const finish = (result) => (result.mfa_management_token && onManage ? onManage(session) : finishSignIn(result.access_token, returnTo));
  return (
    <div className="session-record-block">
      {challenge.next_step === "enroll"
        ? <Enroll session={session} onDone={finish} />
        : <Verify session={session} challenge={challenge} returnTo={returnTo} onDone={finish} />}
    </div>
  );
}

function Enroll({ session, onDone }) {
  const [method, setMethod] = useState(null);
  const info = useAppInfo();
  return (
    <>
      <MfaHeader
        title={info && `${info.name || "Este sistema"} exige verificação em duas etapas`}
        description={method ? null : "Adicione uma segunda etapa de acesso para proteger sua conta. Escolha como quer receber os códigos."}
      />
      {method ? (
        <MfaMethodSetup session={session} method={method} onDone={onDone} onBack={() => setMethod(null)} />
      ) : (
        <div className="space-y-3">
          <Button className="w-full h-12 font-medium" onClick={() => setMethod("totp")}>Configurar app autenticador</Button>
          <Button variant="outline" className="w-full h-12 font-medium" onClick={() => setMethod("sms")}>Informar número de celular</Button>
        </div>
      )}
    </>
  );
}

function Verify({ session, challenge, returnTo, onDone }) {
  const methods = challenge.mfa_methods;
  const [method, setMethod] = useState(methods.includes("totp") ? "totp" : "sms");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useCooldown();
  const sent = useRef(false);
  const phone = challenge.phone_hint || "seu celular";

  const sendCode = async () => {
    setError(null);
    setSending(true);
    try {
      await session.sendSignInCode();
      setCooldown(SMS_RESEND_SECONDS);
    } catch (err) {
      setError(err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    // Text the code once when SMS is the method in use; resending is the user's call.
    if (method !== "sms" || sent.current) return;
    sent.current = true;
    sendCode();
  }, [method]);

  const verify = async (value = code) => {
    if (busy || value.length < 6) return;
    setError(null);
    setBusy(true);
    try {
      onDone(await session.verify(value, method, remember));
    } catch (err) {
      setError(err);
      setCode("");
      setBusy(false);
    }
  };

  const other = methods.find((value) => value !== method);
  return (
    <>
      <MfaHeader title="Confirme sua identidade" />
      <div className="space-y-4">
        <MfaNotice error={error} />
        <p className="text-sm text-muted-foreground text-center">
          {method === "totp" ? "Digite o código do seu app autenticador"
            : sending && !cooldown ? `Enviando código para ${phone}…` : `Digite o código enviado para ${phone}`}
        </p>
        <CodeField id="mfa-code" value={code} onChange={setCode} onComplete={verify} />
        <RememberDevice checked={remember} onChange={setRemember} />
        <Button className="w-full h-12 font-medium" disabled={busy || code.length < 6} onClick={() => verify()}>
          {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {busy ? "Verificando..." : "Verificar"}
        </Button>
        {method === "sms" && <ResendLine cooldown={cooldown} disabled={sending} onResend={sendCode} />}
        {other && (
          <Button variant="outline" className="w-full" onClick={() => { setMethod(other); setCode(""); setError(null); }}>
            {other === "sms" ? "Verificar por SMS" : "Verificar pelo app autenticador"}
          </Button>
        )}
        <div className="text-center">
          <a href={returnTo && returnTo !== "/" ? "/login?returnTo=" + encodeURIComponent(returnTo) : "/login"} className="text-sm text-muted-foreground hover:underline">Voltar para o login</a>
        </div>
      </div>
    </>
  );
}
