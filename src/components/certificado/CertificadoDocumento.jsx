import { forwardRef } from "react";
import { Image } from "@/components/ui/image";
import { FAIXAS, LOGO_JORNADA, LOGO_UNINASSAU } from "@/lib/evento";

// Documento do certificado em tamanho A4 paisagem (1123×794 px a 96 dpi).
const CertificadoDocumento = forwardRef(function CertificadoDocumento({ dados }, ref) {
  const assinaturas = [
    { nome: dados.reitora_nome, cargo: "Reitora" },
    { nome: dados.coordenador_nome, cargo: "Coordenador da VI Jornada Acadêmica" },
  ].filter((a) => a.nome);

  return (
    <div ref={ref} style={{ width: 1123, background: "#ffffff", padding: 0 }}>
      <div
        style={{
          position: "relative",
          width: 1123,
          height: 700,
          background: "#ffffff",
          overflow: "hidden",
          fontFamily: '"Inter", Arial, sans-serif',
          color: "#1a1f36",
        }}
      >
        <div style={{ position: "absolute", inset: 18, border: "3px solid #011c63" }} />
        <div style={{ position: "absolute", inset: 26, border: "1px solid #ffcb0c" }} />
        {dados.codigo && (
          <p
            style={{
              position: "absolute",
              bottom: 34,
              left: 0,
              right: 0,
              zIndex: 2,
              margin: 0,
              textAlign: "center",
              fontSize: 11,
              color: "#5b6480",
            }}
          >
            Código de autenticidade: <strong>{dados.codigo}</strong> · Valide em
            6jornadaacaduninassau.com/validar
          </p>
        )}

        <img
          src={FAIXAS}
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", bottom: 0, left: 0, width: 300, opacity: 0.9 }}
        />
        <img
          src={FAIXAS}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 300,
            opacity: 0.9,
            transform: "scaleX(-1)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "52px 90px 60px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Image src={LOGO_UNINASSAU} alt="UNINASSAU Teresina" fittingType="fit" style={{ height: 40, width: "auto" }} />
            <span style={{ width: 1, height: 40, background: "#d5dbea" }} />
            <Image src={LOGO_JORNADA} alt="VI Jornada Acadêmica" fittingType="fit" style={{ height: 40, width: "auto" }} />
          </div>

          <p
            style={{
              margin: "28px 0 0",
              fontFamily: '"Montserrat", Arial, sans-serif',
              fontSize: 13,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "#0040ce",
              fontWeight: 700,
            }}
          >
            Certificado
          </p>

          <p style={{ margin: "22px 0 0", fontSize: 16, color: "#5b6480" }}>
            Certificamos que
          </p>

          <h2
            style={{
              margin: "10px 0 0",
              fontFamily: '"Montserrat", Arial, sans-serif',
              fontSize: 44,
              lineHeight: 1.12,
              fontWeight: 800,
              color: "#011c63",
              maxWidth: 860,
            }}
          >
            {dados.nome}
          </h2>

          {dados.cpf && (
            <p style={{ margin: "8px 0 0", fontSize: 15, color: "#5b6480" }}>CPF {dados.cpf}</p>
          )}

          <p style={{ margin: "24px 0 0", maxWidth: 780, fontSize: 17, lineHeight: 1.66 }}>
            participou da <strong>{dados.evento}</strong>, realizada nos dias{" "}
            <strong>{dados.datas}</strong>, em {dados.local}, com carga horária total de{" "}
            <strong>{dados.horas} horas</strong>.
          </p>

          <div style={{ marginTop: "auto", width: "100%" }}>
            <p style={{ margin: "0 0 34px", fontSize: 15, color: "#5b6480" }}>Teresina, dezembro de 2026.</p>

            <div style={{ display: "flex", justifyContent: "center", gap: 90 }}>
              {assinaturas.map((a) => (
                <div key={a.nome} style={{ minWidth: 260 }}>
                  <div style={{ borderTop: "1.5px solid #011c63", paddingTop: 8 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#011c63" }}>{a.nome}</p>
                    <p style={{ margin: 0, fontSize: 13, color: "#5b6480" }}>{a.cargo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CertificadoDocumento;