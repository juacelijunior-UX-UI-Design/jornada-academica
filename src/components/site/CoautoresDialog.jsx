import { Users } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EQUIPES } from "@/lib/evento";

function iniciais(nome) {
  const partes = nome.split(/\s+/).filter((w) => w.length > 2);
  const a = (partes[0] || nome)[0] || "";
  const b = partes[1] ? partes[1][0] : "";
  return (a + b).toUpperCase();
}

const GATILHO_PADRAO =
  "inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/50 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-white hover:text-navy";

export default function CoautoresDialog({ gatilhoClasse = GATILHO_PADRAO, comIcone = true }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={gatilhoClasse}
        >
          {comIcone && <Users className="h-4 w-4" aria-hidden="true" />}
          Co-autores ({EQUIPES.length})
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-[40rem]">
        <DialogHeader className="bg-navy px-5 py-4 text-left">
          <DialogTitle className="text-white">Co-autores</DialogTitle>
          <DialogDescription className="text-[#dbe4fb]">
            Equipes participantes · {EQUIPES.length} pessoas
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto px-5 pb-5">
          <ul className="columns-1 gap-6 sm:columns-2">
            {EQUIPES.map((nome) => (
              <li
                key={nome}
                className="flex break-inside-avoid items-center gap-3 border-b border-linea py-2.5 text-[0.95rem] leading-tight"
              >
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-fundo font-heading text-[0.8rem] font-bold text-navy"
                >
                  {iniciais(nome)}
                </span>
                <span>{nome}</span>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}