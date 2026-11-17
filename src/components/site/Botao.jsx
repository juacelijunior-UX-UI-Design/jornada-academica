import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const VARIANTES = {
  cta: "bg-amarelo text-navy hover:bg-[#e8b800]",
  primario: "bg-royal text-white hover:bg-navy",
  edital: "bg-vermelho text-white hover:bg-[#b8061b]",
  contorno: "border-royal bg-transparent text-royal hover:bg-royal hover:text-white",
  contornoClaro:
    "border-white/60 bg-transparent text-white hover:bg-white hover:text-navy",
  claro: "border-white/60 bg-transparent text-white hover:bg-white hover:text-navy",
};

const BASE =
  "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-lg border-2 border-transparent px-5 py-2.5 text-center font-body text-base font-semibold no-underline transition-[background-color,color,transform] duration-150 hover:-translate-y-0.5 active:translate-y-px disabled:pointer-events-none disabled:bg-[#e3e8f4] disabled:text-[#3f4a6b]";

export default function Botao({ variante = "primario", to, href, download, className, children, ...props }) {
  const classes = cn(BASE, VARIANTES[variante] ?? VARIANTES.primario, className);
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} download={download} className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...props}>
      {children}
    </button>
  );
}