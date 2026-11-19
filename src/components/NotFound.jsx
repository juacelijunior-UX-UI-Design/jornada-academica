import Botao from "@/components/site/Botao";

export function NotFound({ children }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-heading text-6xl font-extrabold tracking-tight text-navy">404</p>
      <span aria-hidden="true" className="h-1 w-12 rounded bg-amarelo" />
      <p className="text-tinta-suave">{children ?? "A página que você procura não existe ou mudou de endereço."}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Botao variante="contorno" onClick={() => window.history.back()}>
          Voltar
        </Botao>
        <Botao to="/" variante="primario">
          Ir para o início
        </Botao>
      </div>
    </div>
  );
}
