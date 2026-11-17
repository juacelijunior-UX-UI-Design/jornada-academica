import Campo from "@/components/inscricao/Campo";
import Coautores from "@/components/inscricao/Coautores";
import { mascaraCpf, mascaraTelefone, mascaraMatricula } from "@/lib/validacao";

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
      <fieldset className="mb-4">
        <legend className="jr-label">Você é</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
          {[
            ["aluno", "Sou aluno"],
            ["externo", "Público externo"],
          ].map(([valor, texto]) => (
            <label key={valor} className="flex cursor-pointer items-center gap-2 font-medium">
              <input
                type="radio"
                name="tipo"
                value={valor}
                checked={form.tipo === valor}
                onChange={() => setCampo("tipo", valor)}
                className="h-4 w-4 accent-[#0040ce]"
              />
              {texto}
            </label>
          ))}
        </div>
      </fieldset>

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