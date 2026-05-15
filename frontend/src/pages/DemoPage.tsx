import { CheckCircle2, CircleDot, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DemoControlPanel } from '@/components/demo/DemoControlPanel'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useDemoFlow } from '@/hooks/useDemoFlow'
import { formatUsdc, shortenAddress } from '@/utils/format'

const checklist = [
  'Criar pesquisa',
  'Criar milestones',
  'Ver pesquisa na listagem',
  'Abrir detalhes',
  'Conectar wallet',
  'Financiar',
  'Submeter milestone',
  'Ver análise IA',
  'Votar approve/reject',
  'Finalizar votação',
  'Liberar fundos ou pedir refund',
]

export default function DemoPage() {
  const {
    summary,
    loading,
    activeAction,
    error,
    message,
    seed,
    applyScenario,
    reload,
  } = useDemoFlow()
  const primaryProject = summary?.projects.find(
    (project) => project.id === summary.primaryProjectId,
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Modo demo"
        subtitle="Controle rápido para apresentar o fluxo sem depender de cadastro manual ou preparação ao vivo."
        action={
          <Button variant="ghost" onClick={() => void reload()}>
            Atualizar
          </Button>
        }
      />

      {error && (
        <Card glow="purple">
          <p className="text-sm text-purple-100">{error}</p>
        </Card>
      )}

      {message && (
        <Card glow="green">
          <p className="text-sm text-green-100">{message}</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <Card glow="green" className="space-y-4">
            <div>
              <p className="font-mono text-xs uppercase text-green-300">
                checklist
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-100">
                Fluxo principal
              </h2>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {checklist.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/55 px-3 py-2"
                >
                  {index < 8 ? (
                    <CheckCircle2 className="size-4 text-green-300" />
                  ) : (
                    <CircleDot className="size-4 text-cyan-300" />
                  )}
                  <span className="text-sm text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card glow="cyan" className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase text-cyan-300">
                  projeto seedado
                </p>
                <h2 className="mt-2 text-lg font-semibold text-slate-100">
                  {loading
                    ? 'Carregando dados...'
                    : primaryProject?.title ?? 'Seed ainda não criado'}
                </h2>
              </div>
              {primaryProject && (
                <Badge status={primaryProject.status} label={primaryProject.status} />
              )}
            </div>

            {primaryProject && (
              <>
                <p className="text-sm leading-6 text-slate-400">
                  {primaryProject.description}
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-xs text-slate-500">Meta</span>
                    <p className="mt-1 font-mono text-sm text-slate-100">
                      {formatUsdc(primaryProject.totalAmount)} USDC
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-xs text-slate-500">Contribuições</span>
                    <p className="mt-1 font-mono text-sm text-slate-100">
                      {primaryProject.contributions.length}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <span className="text-xs text-slate-500">Milestones</span>
                    <p className="mt-1 font-mono text-sm text-slate-100">
                      {primaryProject.milestones.length}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {primaryProject.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/55 px-3 py-2"
                    >
                      <span className="text-sm text-slate-300">
                        Etapa {milestone.order}: {milestone.title}
                      </span>
                      <Badge status={milestone.status} label={milestone.status} />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/explore"
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 text-sm text-slate-300 transition hover:bg-slate-800"
                  >
                    Listagem
                  </Link>
                  <Link
                    to={`/research/${primaryProject.id}`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-cyan-300/35 px-3 text-sm text-cyan-100 transition hover:bg-cyan-300/10"
                  >
                    Detalhes
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              </>
            )}
          </Card>
        </section>

        <aside className="space-y-6">
          <DemoControlPanel
            summary={summary}
            activeAction={activeAction}
            onSeed={seed}
            onScenario={applyScenario}
          />

          <Card glow="purple" className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-100">
              Wallets seedadas
            </h2>
            {summary?.projects[0]?.contributions.map((contribution) => (
              <div
                key={contribution.id}
                className="rounded-lg border border-slate-800 bg-slate-950/55 p-3"
              >
                <p className="font-mono text-xs text-purple-200">
                  {shortenAddress(contribution.wallet)}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {formatUsdc(contribution.amount)} USDC
                </p>
              </div>
            ))}
          </Card>
        </aside>
      </div>
    </div>
  )
}
