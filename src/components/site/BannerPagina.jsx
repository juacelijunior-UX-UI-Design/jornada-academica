// Faixa azul do topo das páginas internas do site (Inscrição, Check-in, Certificado, Validar).
// `sobreposto` deixa mais espaço embaixo para o cartão da página subir sobre a faixa.
export default function BannerPagina({ selo, titulo, descricao, sobreposto = false }) {
  return (
    <section
      className={`bg-navy bg-[linear-gradient(100deg,#011c63_0%,#0b2a86_50%,#1746b8_100%)] pt-10 text-white sm:pt-12 ${
        sobreposto ? "pb-32" : "pb-16"
      }`}
    >
      <div className="jr-container">
        {selo && (
          <p className="m-0 mb-2 text-[0.85rem] font-semibold uppercase tracking-[0.1em] text-amarelo">{selo}</p>
        )}
        {titulo && (
          <h1 className="filete font-heading text-[clamp(2rem,6vw,2.75rem)] font-extrabold leading-tight text-white">
            {titulo}
          </h1>
        )}
        {descricao && <p className="m-0 mt-4 max-w-2xl text-white/85">{descricao}</p>}
      </div>
    </section>
  );
}
