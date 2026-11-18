import { createFileRoute } from "@tanstack/react-router";
import HeroJornada from "@/components/landing/HeroJornada";
import SobreJornada from "@/components/landing/SobreJornada";
import ComoParticipar from "@/components/landing/ComoParticipar";
import DoacaoCard from "@/components/landing/DoacaoCard";
import Programacao from "@/components/landing/Programacao";
import Cronograma from "@/components/landing/Cronograma";
import FaqJornada from "@/components/landing/FaqJornada";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "VI Jornada Acadêmica da Uninassau Teresina" },
      {
        name: "description",
        content:
          "VI Jornada Acadêmica da Uninassau Teresina, em 09 e 10/12/2026. Inscrições de trabalhos de 16 a 30/11/2026.",
      },
      { property: "og:title", content: "VI Jornada Acadêmica da Uninassau Teresina" },
      {
        property: "og:description",
        content: "Conhecimento que conecta pessoas e transforma realidades. 09 e 10 de dezembro de 2026.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <HeroJornada />
      <SobreJornada />
      <ComoParticipar />
      <DoacaoCard />
      <Programacao />
      <Cronograma />
      <FaqJornada />
    </>
  );
}