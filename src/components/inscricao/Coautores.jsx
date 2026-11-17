import { Plus, Trash2 } from "lucide-react";
import { MAX_COAUTORES } from "@/lib/validacao";

export default function Coautores({ coautores = [], setCoautores, erro }) {
  const cheio = coautores.length >= MAX_COAUTORES;

  const atualizar = (indice, valor) =>
    setCoautores(coautores.map((nome, i) => (i === indice ? valor : nome)));

  const remover = (indice) => setCoautores(coautores.filter((_, i) => i !== indice));

  const adicionar = () => {
    if (!cheio) setCoautores([...coautores, ""]);
  };

  return (
    <div className="mb-4 rounded-lg border border-linea bg-white/70 p-4">
      <p className="m-0 font-semibold text-navy">
        Co-autores do trabalho <span className="font-normal text-tinta-suave">(opcional)</span>
      </p>
      <p className="jr-legenda mt-1">
        Acrescente até {MAX_COAUTORES} nomes, além do apresentador.
      </p>

      {coautores.length > 0 && (
        <ul className="m-0 mt-3 list-none space-y-2 p-0">
          {coautores.map((nome, indice) => (
            <li key={indice} className="flex items-center gap-2">
              <input
                id={`coautor-${indice}`}
                type="text"
                value={nome}
                maxLength={150}
                autoComplete="off"
                placeholder={`Nome completo do co-autor ${indice + 1}`}
                aria-label={`Nome completo do co-autor ${indice + 1}`}
                onChange={(e) => atualizar(indice, e.target.value)}
                className="jr-input"
              />
              <button
                type="button"
                onClick={() => remover(indice)}
                aria-label={`Remover co-autor ${indice + 1}`}
                className="flex h-12 w-12 flex-none items-center justify-center rounded-lg border-[1.5px] border-linea text-vermelho-texto transition hover:border-vermelho hover:bg-[#fdecee]"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={adicionar}
        disabled={cheio}
        className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-royal bg-white px-4 py-2 font-semibold text-royal transition hover:bg-[#e9effc] disabled:cursor-not-allowed disabled:border-linea disabled:bg-transparent disabled:text-tinta-suave"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {cheio ? `Limite de ${MAX_COAUTORES} co-autores atingido` : "Adicionar co-autor"}
      </button>

      {erro && (
        <p id="erro-coautores" className="jr-erro">
          {erro}
        </p>
      )}
    </div>
  );
}