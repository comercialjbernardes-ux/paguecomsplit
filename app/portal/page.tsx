import {
  Users,
  Coins,
  TrendingUp,
  Clock,
  Link2,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { CopyLinkButton } from "@/components/CopyLinkButton";

export const metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

const STAT_CARDS = [
  {
    label: "Leads indicados",
    value: "—",
    sub: "Total enviados",
    icon: Users,
    color: "text-accent-600",
    bg: "bg-accent-50",
  },
  {
    label: "Leads ativos",
    value: "—",
    sub: "Em análise ou convertidos",
    icon: TrendingUp,
    color: "text-primary-600",
    bg: "bg-primary-50",
  },
  {
    label: "Comissão acumulada",
    value: "—",
    sub: "A confirmar com o time",
    icon: Coins,
    color: "text-warm-600",
    bg: "bg-warm-500/10",
  },
  {
    label: "Próximo pagamento",
    value: "—",
    sub: "Data a definir",
    icon: Clock,
    color: "text-accent-600",
    bg: "bg-accent-50",
  },
];

const PLACEHOLDER_LEADS: Array<{
  name: string;
  segment: string;
  status: "em_analise" | "convertido" | "perdido";
  date: string;
}> = [];

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  em_analise: {
    label: "Em análise",
    className: "bg-accent-50 text-accent-700",
  },
  convertido: {
    label: "Convertido",
    className: "bg-primary-50 text-primary-600",
  },
  perdido: {
    label: "Perdido",
    className: "bg-warm-500/10 text-warm-600",
  },
};

export default async function PortalDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const firstName = user.name.split(" ")[0];
  const repCode = `rep_${user.userId}`;
  const repLink = `https://paguecomsplit.com.br/?rep=${repCode}`;

  return (
    <div className="container-page py-8">
      {/* Boas-vindas */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-600">
            Portal do Representante
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-700 bg-accent-50 px-2 py-0.5 rounded-full">
            <BadgeCheck className="h-3 w-3" aria-hidden />
            Ativo
          </span>
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-primary-600">
          Olá, {firstName}!
        </h1>
        <p className="text-sm text-muted mt-1">
          Bem-vindo ao seu painel. Acompanhe seus leads e comissões aqui.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {STAT_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-100 bg-white p-5 shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted">{card.label}</p>
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}
              >
                <card.icon className={`h-4 w-4 ${card.color}`} aria-hidden />
              </span>
            </div>
            <p className="font-display text-2xl font-bold text-primary-600 tabular-nums">
              {card.value}
            </p>
            <p className="text-xs text-muted mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leads recentes */}
        <div className="lg:col-span-2 rounded-xl border border-slate-100 bg-white shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-display text-base font-bold text-primary-600">
              Leads recentes
            </h2>
            <a
              href="/portal/leads"
              className="text-xs font-semibold text-accent-600 hover:text-accent-700 flex items-center gap-1"
            >
              Ver todos
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>

          {PLACEHOLDER_LEADS.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
              <Users className="h-10 w-10 text-slate-200 mb-3" aria-hidden />
              <p className="font-display text-sm font-semibold text-primary-600 mb-1">
                Nenhum lead ainda
              </p>
              <p className="text-xs text-muted max-w-xs text-pretty">
                Compartilhe seu link de indicação para que leads comecem a aparecer aqui.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3">
                    Nome
                  </th>
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3">
                    Segmento
                  </th>
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {PLACEHOLDER_LEADS.map((lead, i) => {
                  const status = STATUS_LABEL[lead.status];
                  return (
                    <tr key={i} className="border-b border-slate-50 hover:bg-bg">
                      <td className="px-5 py-3 font-medium text-text">
                        {lead.name}
                      </td>
                      <td className="px-5 py-3 text-muted">{lead.segment}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted tabular-nums">
                        {lead.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Painel lateral */}
        <div className="flex flex-col gap-4">
          {/* Meu link */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="h-4 w-4 text-accent-600" aria-hidden />
              <h2 className="font-display text-sm font-bold text-primary-600">
                Meu link de indicação
              </h2>
            </div>
            <div className="rounded-lg bg-bg border border-slate-100 px-3 py-2 mb-3">
              <p className="text-xs font-mono text-muted break-all leading-relaxed">
                {repLink}
              </p>
            </div>
            <CopyLinkButton link={repLink} />
            <p className="text-xs text-muted mt-3 text-pretty">
              Compartilhe este link. Leads que chegarem por ele são
              automaticamente atribuídos à sua carteira.
            </p>
          </div>

          {/* Dados do perfil */}
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-card">
            <h2 className="font-display text-sm font-bold text-primary-600 mb-3">
              Meu perfil
            </h2>
            <dl className="space-y-2.5">
              <ProfileRow label="Nome" value={user.name} />
              <ProfileRow label="E-mail" value={user.email} />
              <ProfileRow
                label="Perfil"
                value={
                  user.role === "admin"
                    ? "Administrador"
                    : user.role === "cliente"
                    ? "Cliente"
                    : "Representante"
                }
              />
            </dl>
            <a
              href="/portal/perfil"
              className="mt-4 text-xs font-semibold text-accent-600 hover:text-accent-700 flex items-center gap-1"
            >
              Editar perfil
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>

          {/* Suporte */}
          <div className="rounded-xl border border-accent-200 bg-accent-50 p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-accent-700 mb-2">
              Precisa de ajuda?
            </p>
            <p className="text-xs text-accent-800 text-pretty mb-3">
              Fale com o time comercial diretamente pelo WhatsApp.
            </p>
            <a
              href="https://wa.me/553195719123?text=Portal: preciso de ajuda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-700 hover:text-accent-800 underline underline-offset-2"
            >
              Abrir WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-muted whitespace-nowrap">{label}</dt>
      <dd className="text-xs font-semibold text-text text-right truncate">
        {value}
      </dd>
    </div>
  );
}
