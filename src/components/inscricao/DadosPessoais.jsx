import Campo from "@/components/inscricao/Campo";
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
      <Campo id="nome" label="Nome completo" erro={erros.nome}>
        <input {...props("nome")} type="text" autoComplete="name" maxLength={150} />
      </Campo>

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
              placeholder="Somente números"
              onChange={(e) => setCampo("matricula", mascaraMatricula(e.target.value))}
            />
          </Campo>
        )}
      </div>
    </>
  );
}
