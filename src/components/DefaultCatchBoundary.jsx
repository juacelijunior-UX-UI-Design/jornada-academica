import { ErrorComponent, Link, rootRouteId, useMatch, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function DefaultCatchBoundary({ error }) {
  const router = useRouter();
  const isRoot = useMatch({ strict: false, select: (state) => state.id === rootRouteId });

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
      <p className="font-heading text-2xl font-extrabold text-navy">Algo deu errado</p>
      <p className="text-tinta-suave">Tente de novo em instantes. Se o problema continuar, volte para o início.</p>
      <ErrorComponent error={error} />
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => router.invalidate()}>
          Tentar de novo
        </Button>
        <Button asChild>{isRoot ? <Link to="/">Início</Link> : <Link to="/" onClick={(e) => { e.preventDefault(); window.history.back(); }}>Voltar</Link>}</Button>
      </div>
    </div>
  );
}
