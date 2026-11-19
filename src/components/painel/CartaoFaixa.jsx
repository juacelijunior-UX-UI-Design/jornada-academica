// Cartão do painel com faixa de título azul e filete amarelo (mesma identidade dos cabeçalhos das tabelas).
export default function CartaoFaixa({ Icone, titulo, descricao, extra, children, className = "", corpoClassName = "p-5" }) {
  return (
    <section className={`jr-card overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b-[3px] border-amarelo bg-navy px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {Icone && (
            <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-white/10 text-amarelo">
              <Icone className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="m-0 font-heading text-[1rem] font-extrabold leading-tight text-white">{titulo}</h2>
            {descricao && <p className="m-0 mt-0.5 text-[0.82rem] leading-snug text-white/75">{descricao}</p>}
          </div>
        </div>
        {extra && <div className="flex flex-wrap items-center gap-2">{extra}</div>}
      </div>
      <div className={corpoClassName}>{children}</div>
    </section>
  );
}

// Selo claro para usar no `extra` da faixa (ex.: "24 na lista").
export function SeloFaixa({ children }) {
  return (
    <span className="rounded-full bg-amarelo px-2.5 py-0.5 text-[0.78rem] font-bold text-navy">{children}</span>
  );
}
