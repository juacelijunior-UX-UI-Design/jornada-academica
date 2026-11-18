// Título centralizado de seção da página inicial, com o traço amarelo embaixo.
export default function TituloSecao({ id, children, subtitulo }) {
  return (
    <div className="text-center">
      <h2 id={id} className="jr-titulo-bloco filete after:mx-auto">
        {children}
      </h2>
      {subtitulo && <p className="mx-auto mt-4 max-w-2xl text-[0.98rem] text-tinta-suave">{subtitulo}</p>}
    </div>
  );
}
