import { GraduationCap, Users } from "lucide-react";
import Campo from "@/components/inscricao/Campo";
import Coautores from "@/components/inscricao/Coautores";
import { mascaraCpf, mascaraTelefone, mascaraMatricula } from "@/lib/validacao";

const TIPOS = [
  { valor: "aluno", texto: "Sou aluno", Icone: GraduationCap },
  { valor: "externo", texto: "Público externo", Icone: Users },
];

export default function DadosPessoais({ form, setCampo, erros }) {
  const externo = form.tipo === "externo";
  const props = (id) => ({
    id,
    value: form[id],
    "aria-invalid": erros[id] ? "true" : undefined,
    "aria-describedby": erros[id] ? `erro-${id}` : undefined,
    onChange: (e) => setCampo(id, e.target.value),
    className: "jr-input",
  });

  return (
    <>
      <div className="mb-6">
        <p id="rotulo-tipo" className="jr-label">Você é</p>
        <div
          role="radiogroup"
          aria-labelledby="rotulo-tipo"
          className="grid grid-cols-2 gap-1.5 rounded-xl border border-linea bg-white p-1.5 shadow-[0_4px_16px_rgba(1,28,99,0.08)]"
        >
          {TIPOS.map(({ valor, texto, Icone }) => {
            const ativo = form.tipo === valor;
            return (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={ativo}
                onClick={() => setCampo("tipo", valor)}
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
      </div>

      <Campo id="nome" label="Nome do apresentador" erro={erros.nome}>
        <input {...props("nome")} type="text" autoComplete="name" maxLength={150} />
      </Campo>

      <Coautores
        coautores={form.coautores ?? []}
        setCoautores={(lista) => setCampo("coautores", lista)}
        erro={erros.coautores}
      />

      <div className="grid gap-x-4 md:grid-cols-2">
        <Campo id="email" label="E-mail" erro={erros.email}>
          <input {...props("email")} type="email" autoComplete="email" />
        </Campo>
        <Campo id="telefone" label="Telefone" erro={erros.telefone} ajuda="Com DDD.">
          <input
            {...props("telefone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(99) 99999-9999"
            onChange={(e) => setCampo("telefone", mascaraTelefone(e.target.value))}
          />
        </Campo>
      </div>

      <div className="grid gap-x-4 md:grid-cols-2">
        <Campo id="cpf" label="CPF" erro={erros.cpf}>
          <input
            {...props("cpf")}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="000.000.000-00"
            onChange={(e) => setCampo("cpf", mascaraCpf(e.target.value))}
          />
        </Campo>

        {externo ? (
          <Campo id="instituicao" label="Instituição de origem" erro={erros.instituicao}>
            <input {...props("instituicao")} type="text" maxLength={150} autoComplete="organization" />
          </Campo>
        ) : (
          <Campo id="matricula" label="Matrícula" erro={erros.matricula}>
            <input
              {...props("matricula")}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              onChange={(e) => setCampo("matricula", mascaraMatricula(e.target.value))}
            />
          </Campo>
        )}
      </div>
    </>
  );
}