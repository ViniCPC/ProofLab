import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { ResearchList } from '@/components/research/ResearchList'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useResearchList } from '@/hooks/useResearchList'

const pageSize = 9

export default function ExploreResearchPage() {
  const [page, setPage] = useState(1)
  const { projects, fundingByProjectId, meta, loading, error, refetch } =
    useResearchList(page, pageSize)
  const hasProjects = projects.length > 0
  const totalPages = meta?.totalPages ?? 1
  const canGoPrevious = page > 1 && !loading
  const canGoNext = page < totalPages && !loading

  return (
    <div className="animate-[fade-in_0.4s_ease-out] space-y-6">
      <PageHeader
        title="Explorar pesquisas"
        subtitle="Projetos científicos disponíveis para financiamento transparente, com etapas e validação comunitária."
        action={
          <Link to="/create">
            <Button>Enviar pesquisa</Button>
          </Link>
        }
      />

      {loading && (
        <Card glow="cyan">
          <p className="text-sm text-slate-400">Carregando pesquisas...</p>
        </Card>
      )}

      {error && (
        <Card glow="purple" className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-300">{error}</p>
          <Button variant="secondary" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </Card>
      )}

      {!loading && !error && !hasProjects && (
        <Card glow="green">
          <p className="text-sm text-slate-400">
            Ainda não há pesquisas disponíveis. Seja o primeiro a criar uma
            proposta científica para funding.
          </p>
        </Card>
      )}

      {!loading && !error && hasProjects && (
        <>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{meta?.total ?? projects.length} projetos encontrados</span>
            <span>
              Página {meta?.page ?? page} de {totalPages}
            </span>
          </div>
          <ResearchList
            projects={projects}
            fundingByProjectId={fundingByProjectId}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              disabled={!canGoPrevious}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!canGoNext}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Próxima
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
