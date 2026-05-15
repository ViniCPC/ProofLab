import { PageHeader } from '@/components/layout/PageHeader'
import { ResearchForm } from '@/components/research/ResearchForm'
import { useCreateResearch } from '@/hooks/useCreateResearch'

export default function CreateResearchPage() {
  const { loading, error, success, createdResearch, createResearch } =
    useCreateResearch()
  const successMessage = success
    ? `Pesquisa criada com sucesso: ${createdResearch?.title ?? 'rascunho salvo'}.`
    : null

  return (
    <div className="animate-[fade-in_0.4s_ease-out]">
      <PageHeader
        title="Criar pesquisa"
        subtitle="Cadastre uma proposta científica com meta de financiamento, etapas e contexto para análise de IA."
      />
      <ResearchForm
        loading={loading}
        error={error}
        successMessage={successMessage}
        onSubmit={createResearch}
      />
    </div>
  )
}
