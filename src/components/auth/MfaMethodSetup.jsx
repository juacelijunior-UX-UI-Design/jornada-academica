import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  CodeField, CopyKeyButton, INVALID_PHONE, MfaNotice, PhoneField, ResendLine,
  defaultDialCode, isPlausiblePhone, isTouchDevice, useCooldown,
} from "@/components/auth/MfaParts";

const SMS_RESEND_SECONDS = 30;
const FULL_CODE = "Digite o código completo de 6 dígitos";

// Sets up one method: method is "totp" (authenticator app) or "sms" (text messages).
// onDone receives the server's result once the code is confirmed; onBack leaves the setup.
export function MfaMethodSetup({ session, method, onDone, onBack, signInPath }) {
  const [setup, setSetup] = useState(null);
  const [step, setStep] = useState("start");
  const [countryCode, setCountryCode] = useState(defaultDialCode);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [fieldError, setFieldError] = useState(null);
  const [error, setError] = useState(null);
  const [resendError, setResendError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useCooldown();
  const started = useRef(false);
  const fullPhone = `${countryCode}${phoneNumber}`;

  // Runs a request with the buttons held; a failure goes to onError and the result is null.
  const run = async (action, onError) => {
    setBusy(true);
    try {
      return await action();
    } catch (err) {
      onError(err);
      return null;
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    // Each setup call issues a new secret, so start it once.
    if (method !== "totp" || started.current) return;
    started.current = true;
    run(() => session.setupAuthenticator(), setError).then((result) => result && setSetup(result));
  }, [method, session]);

  // A number that can't be real never reaches the server. A server rejection that names the phone shows
  // as the same field error; anything else shows under the field as it is.
  const sendCode = async () => {
    setFieldError(null);
    setError(null);
    setResendError(null);
    if (!isPlausiblePhone(fullPhone)) {
      setFieldError(INVALID_PHONE);
      return;
    }
    const sent = await run(() => session.sendPhoneCode(fullPhone), (err) => {
      if (err.message?.toLowerCase().includes("phone")) setFieldError(INVALID_PHONE);
      else setError(err);
    });
    if (sent) {
      setStep("code");
      setCode("");
      setCooldown(SMS_RESEND_SECONDS);
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setResendError(null);
    try {
      await session.sendPhoneCode(fullPhone);
      setCooldown(SMS_RESEND_SECONDS);
    } catch (err) {
      setResendError(err.message || "Não foi possível reenviar");
    }
  };

  // An incomplete code is flagged without a request. A wrong one keeps the digits and says so under them.
  const confirm = async (value = code) => {
    if (busy) return;
    if (value.length !== 6) {
      setFieldError(FULL_CODE);
      return;
    }
    setFieldError(null);
    setError(null);
    const result = await run(
      () => (method === "totp" ? session.confirmAuthenticator(value) : session.confirmPhone(value)),
      (err) => (err.mustSignInAgain ? setError(err) : setFieldError(err.message || "Código inválido")),
    );
    if (result) onDone(result);
  };

  const backToStart = () => {
    setStep("start");
    setCode("");
    setFieldError(null);
    setError(null);
    setResendError(null);
  };

  const actions = (secondary, onSecondary, primary, onPrimary, disabled = false) => (
    <div className="grid grid-cols-2 gap-3 pt-2">
      <Button variant="outline" className="h-11" disabled={busy} onClick={onSecondary}>{secondary}</Button>
      <Button className="h-11" disabled={busy || disabled} onClick={onPrimary}>
        {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {primary}
      </Button>
    </div>
  );

  if (method === "totp" && step === "start") {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">Configurar app autenticador</h2>
        <MfaNotice error={error} signInPath={signInPath} />
        {!setup && !error && <Loader2 className="mx-auto w-6 h-6 animate-spin text-muted-foreground" />}
        {setup && (isTouchDevice() ? (
          <div className="space-y-3 text-sm">
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Copie a chave abaixo.</li>
              <li>No app autenticador, adicione uma conta e cole a chave.</li>
              <li>Volte aqui e digite o código que o app mostrar.</li>
            </ol>
            <code className="block rounded-lg border border-border px-3 py-3 text-center font-mono font-medium tracking-wider break-all">
              {setup.secret_formatted}
            </code>
            <CopyKeyButton text={setup.secret_formatted} wide />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-sm">
            <p className="font-medium">Escaneie o QR Code com o seu app autenticador</p>
            <img src={setup.qr_code} alt="QR code for authenticator app setup" className="w-36 h-36 rounded-lg border border-border bg-white p-1" />
            <p className="text-muted-foreground mt-3">Não consegue escanear? Digite a chave manualmente:</p>
            <div className="flex flex-wrap items-center justify-center gap-1">
              <code className="font-mono font-medium tracking-wider break-all">{setup.secret_formatted}</code>
              <CopyKeyButton text={setup.secret_formatted} />
            </div>
          </div>
        ))}
        {actions("Cancelar", onBack, "Continuar", () => setStep("code"), !setup)}
      </div>
    );
  }

  if (method === "sms" && step === "start") {
    const phoneError = fieldError ?? (error && !error.mustSignInAgain ? error.message : null);
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-center">Informe seu número de celular</h2>
        <p className="text-sm text-muted-foreground text-center">Enviaremos um código de verificação para confirmar que o número é seu.</p>
        <div className="space-y-1.5">
          <Label htmlFor="mfa-phone">Número de celular</Label>
          <PhoneField
            countryCode={countryCode} onCountryCodeChange={setCountryCode}
            phoneNumber={phoneNumber} onPhoneNumberChange={(value) => { setPhoneNumber(value); setFieldError(null); }}
            error={phoneError} onSubmit={!busy && phoneNumber.length >= 4 ? sendCode : undefined}
          />
        </div>
        {error?.mustSignInAgain && <MfaNotice error={error} signInPath={signInPath} />}
        {actions("Cancelar", onBack, "Enviar código", sendCode, phoneNumber.length < 4)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-center">
        {method === "totp" ? "Digite um código do seu app autenticador" : "Confirme seu número de celular"}
      </h2>
      {method === "sms" && <p className="text-sm text-muted-foreground text-center">A 6-digit code sent to {countryCode} {phoneNumber}</p>}
      <div className="flex flex-col items-center gap-2">
        <CodeField id="mfa-setup-code" value={code} onChange={(value) => { setCode(value); setFieldError(null); }}
          onComplete={confirm} hasError={Boolean(fieldError)} />
        {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
        {method === "totp"
          ? <p className="text-xs text-muted-foreground">Os códigos mudam a cada 30 segundos.</p>
          : <ResendLine cooldown={cooldown} onResend={resend} error={resendError} />}
      </div>
      <MfaNotice error={error} signInPath={signInPath} />
      {actions("Voltar", backToStart, "Verificar", () => confirm())}
    </div>
  );
}
