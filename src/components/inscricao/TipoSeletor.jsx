import { GraduationCap, Users } from "lucide-react";

const TIPOS = [
  { valor: "aluno", texto: "Sou aluno", Icone: GraduationCap },
  { valor: "externo", texto: "Público externo", Icone: Users },
];

// Abas "Sou aluno" / "Público externo" no topo da página de inscrição.
export default function TipoSeletor({ valor, onMudar }) {
  return (
    <div
      role="radiogroup"
      aria-label="Tipo de inscrição"
      className="grid grid-cols-2 gap-1.5 rounded-xl bg-white p-1.5 shadow-[0_10px_30px_rgba(1,28,99,0.18)]"
    >
      {TIPOS.map(({ valor: v, texto, Icone }) => {
        const ativo = valor === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => onMudar(v)}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-2 text-center text-[0.95rem] font-semibold transition-colors ${
              ativo ? "bg-navy text-white shadow-sm" : "text-navy hover:bg-fundo"
            }`}
          >
            <Icone className="h-4 w-4 flex-none" aria-hidden="true" />
            {texto}
          </button>
        );
      })}
    </div>
  );
}
