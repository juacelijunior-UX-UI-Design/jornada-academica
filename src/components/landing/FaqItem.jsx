import { ChevronDown } from "lucide-react";

export default function FaqItem({ id, pergunta, resposta, aberto, onToggle }) {
  return (
    <li
      className={`overflow-hidden rounded-lg border border-linea border-l-4 bg-white shadow-[0_2px_12px_rgba(1,28,99,0.08)] ${
        aberto ? "border-l-amarelo" : "border-l-transparent"
      }`}
    >
      <h3 className="m-0">
        <button
          type="button"
          id={`faq-pergunta-${id}`}
          aria-expanded={aberto}
          aria-controls={`faq-resposta-${id}`}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span className="font-heading text-[1.02rem] font-bold leading-snug text-navy">
            {pergunta}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`h-5 w-5 flex-none text-navy transition-transform duration-300 ${
              aberto ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>

      <div
        id={`faq-resposta-${id}`}
        role="region"
        aria-labelledby={`faq-pergunta-${id}`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 text-[0.98rem] leading-relaxed text-tinta-suave">{resposta}</div>
        </div>
      </div>
    </li>
  );
}