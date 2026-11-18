import { Trash2, UserPlus } from "lucide-react";
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
    <div>
      <p className="jr-legenda m-0">
        Acrescente até {MAX_COAUTORES} nomes, além de você. Trabalho individual? Deixe sem co-autores.
      </p>

      {coautores.length > 0 && (
        <ul className="m-0 mt-4 list-none space-y-2 p-0">
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
        className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-navy bg-white px-4 font-semibold text-navy transition hover:bg-navy hover:text-white disabled:cursor-not-allowed disabled:border-linea disabled:bg-transparent disabled:text-tinta-suave"
      >
        <UserPlus className="h-4 w-4" aria-hidden="true" />
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
