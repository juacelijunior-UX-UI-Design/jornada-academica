// Botões lado a lado em que só um fica ativo (abas "Submissão / Participante" e "Sou aluno / Público externo").
export default function TipoSeletor({ opcoes, valor, onMudar, rotulo, destaque = false, rotuloId }) {
  return (
    <div
      role="radiogroup"
      aria-label={rotuloId ? undefined : rotulo}
      aria-labelledby={rotuloId}
      className={`grid gap-1.5 rounded-xl bg-white p-1.5 ${
        destaque
          ? "grid-cols-2 shadow-[0_10px_30px_rgba(1,28,99,0.18)]"
          : "grid-cols-1 border border-linea min-[440px]:grid-cols-2"
      }`}
    >
      {opcoes.map(({ valor: v, texto, Icone }) => {
        const ativo = valor === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => onMudar(v)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-2 text-center font-semibold transition-colors ${
              destaque ? "min-h-12 text-[1rem]" : "min-h-11 text-[0.95rem]"
            } ${ativo ? "bg-navy text-white shadow-sm" : "text-navy hover:bg-fundo"}`}
          >
            {Icone && <Icone className="h-4 w-4 flex-none" aria-hidden="true" />}
            {texto}
          </button>
        );
      })}
    </div>
  );
}
