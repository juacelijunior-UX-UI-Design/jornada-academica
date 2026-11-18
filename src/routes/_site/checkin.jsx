import { createFileRoute } from "@tanstack/react-router";
import AcessoCheckin from "@/components/checkin/AcessoCheckin";

export const Route = createFileRoute("/_site/checkin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Check-in | VI Jornada Acadêmica da Uninassau Teresina" },
      { name: "description", content: "Área da equipe que registra a presença dos inscritos pelo QR Code." },
    ],
  }),
  component: CheckinPage,
});

function CheckinPage() {
  return (
    <>
      <section className="bg-navy bg-[linear-gradient(100deg,#011c63_0%,#0b2a86_50%,#1746b8_100%)] pb-16 pt-10 text-white sm:pt-12">
        <div className="jr-container">
          <h1 className="font-heading text-[clamp(2rem,6vw,2.75rem)] font-extrabold text-white">Check-in</h1>
          <p className="mt-1 max-w-2xl text-white/80">
            Registro de presença pelo QR Code dos inscritos. Acesso apenas para a equipe autorizada pelo administrador.
          </p>
        </div>
      </section>
      <div className="jr-container -mt-8 pb-20">
        <div className="mx-auto max-w-[60rem]">
          <AcessoCheckin />
        </div>
      </div>
    </>
  );
}
