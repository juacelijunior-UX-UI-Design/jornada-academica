import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Mic,
  ScanLine,
  UserCheck,
  Users,
} from "lucide-react";
import { resumoPainel } from "@/lib/fn-equipe";
import { DATA_LIBERACAO_CERTIFICADOS } from "@/lib/evento";
import { PERFIS, SECOES_PAINEL, podeAcessar } from "@/lib/perfis";
import { ICONES_SECAO } from "@/components/painel/PainelNav";
import PainelCabecalho from "@/components/painel/PainelCabecalho";

export const Route = createFileRoute("/_authed/painel/")({
  loader: () => resumoPainel(),
  component: VisaoGeral,
});

const ACESSOS = {
  administrador: "Você gerencia usuários, perfis, inscrições, configurações e certificados.",
  suporte: "Você edita inscrições, configurações e certificados, sem gerenciar usuários.",
  professor: "Você avalia as submissões: aprova ou nega os trabalhos e marca quem apresentou.",
  monitor: "Você faz a leitura dos QR Codes no check-in e registra a chamada.",
};

const [ANO, MES, DIA] = DATA_LIBERACAO_CERTIFICADOS.split("-").map(Number);
const LIBERACAO_BR = `${String(DIA).padStart(2, "0")}/${String(MES).padStart(2, "0")}/${ANO}`;

function diasAteLiberacao() {
  // Liberação às 00:01 de Teresina (UTC-3).
  const alvo = Date.UTC(ANO, MES - 1, DIA, 3, 1);
  return Math.ceil((alvo - Date.now()) / 86400000);
}

function primeiroNome(nome, email) {
  const n = String(nome || "").trim().split(/\s+/)[0];
  return n || String(email || "").split("@")[0];
}

function Numero({ rotulo, valor, detalhe, Icone, to, destaque }) {
  return (
    <Link
      to={to}
      className={`jr-card group flex min-w-0 flex-col p-4 no-underline transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(1,28,99,0.14)] sm:p-5 ${
        destaque ? "border-t-4 border-t-amarelo" : ""
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e9effc] text-royal">
          <Icone className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        </span>
        <ArrowRight className="h-4 w-4 text-tinta-suave opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
      </span>
      <span className="mt-3 block font-heading text-[1.9rem] font-extrabold leading-none text-navy">{valor}</span>
      <span className="mt-1.5 block text-[0.9rem] font-semibold leading-snug text-navy">{rotulo}</span>
      {detalhe && <span className="mt-0.5 block text-[0.8rem] leading-snug text-tinta-suave">{detalhe}</span>}
    </Link>
  );
}

function Pendencia({ Icone, texto, acao, to, tom = "info" }) {
  const cores = {
    alerta: "bg-[#fff6d9] text-[#7a5800]",
    info: "bg-[#e9effc] text-royal",
    ok: "bg-[#e8f6ee] text-[#166b3b]",
  };
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 sm:flex-nowrap">
      <span className="flex min-w-0 flex-1 items-center gap-3">
        <span className={`grid h-9 w-9 flex-none place-items-center rounded-lg ${cores[tom]}`}>
          <Icone className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        </span>
        <span className="min-w-0 text-[0.95rem] text-tinta">{texto}</span>
      </span>
      {to && (
        <Link
          to={to}
          className="inline-flex w-full flex-none items-center gap-1 pl-12 text-[0.9rem] font-semibold text-royal no-underline hover:underline sm:w-auto sm:pl-0"
        >
          {acao}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </li>
  );
}

function VisaoGeral() {
  const { perfil, nome, email, numeros } = Route.useLoaderData();
  const n = numeros || {};
  const dias = diasAteLiberacao();
  const atalhos = SECOES_PAINEL.filter((s) => s.id !== "visao" && podeAcessar(perfil, s.id));
  const ehAdmin = perfil === "administrador";
  const semMarcacao = Math.max(0, (n.submissoes ?? 0) - (n.apresentados ?? 0));

  const pendencias = [];
  if (ehAdmin && n.pedidosCheckin > 0) {
    pendencias.push({
      Icone: ScanLine,
      tom: "alerta",
      texto: (
        <>
          <strong>{n.pedidosCheckin}</strong> inscrição(ões) de monitor aguardando sua aprovação.
        </>
      ),
      acao: "Responder",
      to: "/painel/usuarios",
    });
  }
  if (semMarcacao > 0 && podeAcessar(perfil, "inscricoes")) {
    pendencias.push({
      Icone: Mic,
      tom: "info",
      texto: (
        <>
          <strong>{semMarcacao}</strong> submissão(ões) ainda sem a marcação “Apresentou”.
        </>
      ),
      acao: "Ver submissões",
      to: "/painel/inscricoes",
    });
  }
  pendencias.push(
    dias > 0
      ? {
          Icone: Award,
          tom: "info",
          texto: (
            <>
              Certificados liberados em <strong>{LIBERACAO_BR}</strong> — faltam <strong>{dias}</strong> dia(s).
            </>
          ),
          acao: "Configurações",
          to: podeAcessar(perfil, "configuracoes") ? "/painel/configuracoes" : null,
        }
      : {
          Icone: CheckCircle2,
          tom: "ok",
          texto: "Os certificados já podem ser emitidos.",
          acao: "Emitir",
          to: podeAcessar(perfil, "configuracoes") ? "/painel/configuracoes" : null,
        }
  );

  return (
    <>
      <PainelCabecalho
        Icone={LayoutDashboard}
        titulo={`Olá, ${primeiroNome(nome, email)}!`}
        descricao={ACESSOS[perfil] || ""}
      >
        <span className="rounded-full bg-navy px-3 py-1 text-[0.8rem] font-semibold text-white">
          Perfil: {PERFIS[perfil]}
        </span>
      </PainelCabecalho>

      <section aria-label="Números do evento" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Numero
          rotulo="Submissões"
          valor={n.submissoes ?? 0}
          detalhe={`${n.apresentados ?? 0} já apresentaram`}
          Icone={FileText}
          to="/painel/inscricoes"
          destaque
        />
        <Numero
          rotulo="Participantes"
          valor={n.participantes ?? 0}
          detalhe={`${n.inscritos ?? 0} inscrições no total`}
          Icone={Users}
          to="/painel/inscricoes"
        />
        <Numero
          rotulo="Presenças registradas"
          valor={n.presencas ?? 0}
          detalhe={`${n.sessoes ?? 0} atividade(s) cadastradas`}
          Icone={UserCheck}
          to="/painel/checkin"
        />
        <Numero
          rotulo="Certificados emitidos"
          valor={n.certificados ?? 0}
          detalhe={dias > 0 ? `Liberação em ${LIBERACAO_BR}` : "Emissão liberada"}
          Icone={Award}
          to={podeAcessar(perfil, "configuracoes") ? "/painel/configuracoes" : "/painel"}
        />
      </section>

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section className="jr-card p-5">
          <h2 className="font-heading text-[1.1rem] font-extrabold text-navy">O que precisa de atenção</h2>
          <p className="jr-legenda mt-0.5">Atualizado ao abrir esta página.</p>
          <ul className="mt-2 divide-y divide-linea">
            {pendencias.map((p, i) => (
              <Pendencia key={i} {...p} />
            ))}
          </ul>
        </section>

        <section className="jr-card p-5">
          <h2 className="font-heading text-[1.1rem] font-extrabold text-navy">Acesso rápido</h2>
          <p className="jr-legenda mt-0.5">As áreas liberadas para o seu perfil.</p>
          <ul className="mt-3 grid gap-2">
            {atalhos.map((s) => {
              const Icone = ICONES_SECAO[s.id];
              return (
                <li key={s.id}>
                  <Link
                    to={s.to}
                    className="group flex items-center gap-3 rounded-lg border border-linea p-3 no-underline transition hover:border-royal hover:bg-[#f5f8ff]"
                  >
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-navy text-amarelo">
                      <Icone className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-navy">{s.titulo}</span>
                      <span className="block text-[0.85rem] leading-snug text-tinta-suave">{s.resumo}</span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 flex-none text-tinta-suave transition group-hover:translate-x-0.5 group-hover:text-royal"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
