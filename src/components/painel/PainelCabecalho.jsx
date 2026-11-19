// Cabeçalho padrão das páginas do painel: ícone, título, descrição e (opcional) ações à direita.
export default function PainelCabecalho({ Icone, titulo, descricao, children }) {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-linea pb-5">
      <div className="flex min-w-0 items-start gap-3.5">
        {Icone && (
          <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-navy text-amarelo shadow-[0_4px_12px_rgba(1,28,99,0.2)]">
            <Icone className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="font-heading text-[clamp(1.3rem,3.6vw,1.75rem)] font-extrabold leading-tight text-navy">
            {titulo}
          </h1>
          {descricao && <p className="mt-1 max-w-3xl text-[0.95rem] text-tinta-suave">{descricao}</p>}
        </div>
      </div>
      {children && <div className="flex min-w-0 flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
