import { Download, FileText, Presentation } from "lucide-react";
import Botao from "@/components/site/Botao";

export default function ModeloCard({ titulo, descricao, arquivos }) {
  return (
    <article className="jr-card flex flex-col border-t-[5px] border-amarelo p-6">
      <h2 className="font-heading text-[1.25rem] font-extrabold text-navy">{titulo}</h2>
      <p className="jr-legenda mb-5 mt-2">{descricao}</p>
      <div className="mt-auto flex flex-wrap gap-3">
        {arquivos.map((a) => {
          const Icone = a.tipo === "PPTX" ? Presentation : FileText;
          return (
            <Botao
              key={a.tipo}
              href={a.url}
              download={a.nome}
              target="_blank"
              rel="noopener noreferrer"
              variante={a.tipo === "PDF" ? "edital" : "primario"}
            >
              <Icone className="h-5 w-5" aria-hidden="true" />
              {a.tipo === "PPTX" ? "Slides (PPTX)" : "Versão PDF"}
              <Download className="h-4 w-4" aria-hidden="true" />
            </Botao>
          );
        })}
      </div>
    </article>
  );
}