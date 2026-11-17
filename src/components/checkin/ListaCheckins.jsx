const utc = (d) => (/[zZ]|[+-]\d\d:?\d\d$/.test(d) ? d : `${d}Z`);
const FUSO = "America/Fortaleza";

export const formatarDia = (d) =>
  new Date(utc(d)).toLocaleDateString("pt-BR", { timeZone: FUSO });
export const formatarHora = (d) =>
  new Date(utc(d)).toLocaleTimeString("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit", second: "2-digit" });

export default function ListaCheckins({ registros }) {
  if (!registros.length) {
    return <p className="jr-legenda">Nenhuma presença registrada nesta atividade ainda.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-linea bg-white">
      <table className="w-full min-w-[34rem] text-left text-[0.95rem]">
        <thead className="bg-fundo text-navy">
          <tr>
            <th className="px-3 py-2">Participante</th>
            <th className="px-3 py-2">Dia</th>
            <th className="px-3 py-2">Horário</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Registrado por</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r) => (
            <tr key={r.id} className="border-t border-linea">
              <td className="px-3 py-2 font-semibold">{r.nome}</td>
              <td className="px-3 py-2">{formatarDia(r.hora)}</td>
              <td className="px-3 py-2">{formatarHora(r.hora)}</td>
              <td className="px-3 py-2">
                <span className="rounded-full bg-[#e8f6ee] px-2.5 py-0.5 text-sm font-semibold text-[#166b3b]">
                  {r.status}
                </span>
              </td>
              <td className="px-3 py-2 text-tinta-suave">{r.registrado_por}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}