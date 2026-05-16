import {
  Bot,
  Coins,
  FlaskConical,
  GitCommitVertical,
  Landmark,
  Network,
  ShieldCheck,
  Sparkles,
  Vote,
  WalletCards,
} from 'lucide-react'

export const homePageContent = {
  hero: {
    badge: 'Demo Solana Devnet',
    title: 'Funding science with programmable trust.',
    subtitle:
      'ProofLab uses AI, community governance and Solana escrow to fund scientific research by milestones.',
    primaryAction: {
      label: 'Explorar pesquisas',
      to: '/explore',
    },
    secondaryAction: {
      label: 'Criar pesquisa',
      to: '/create',
    },
  },
  flow: [
    {
      icon: FlaskConical,
      title: 'Criar',
      description:
        'O pesquisador cadastra a proposta, valor total e etapas de entrega.',
    },
    {
      icon: WalletCards,
      title: 'Financiar',
      description:
        'A comunidade aporta USDC de forma mockada agora, preparada para escrow Solana.',
    },
    {
      icon: Bot,
      title: 'Revisar',
      description:
        'A IA resume riscos, progresso e evidencias para qualquer pessoa entender.',
    },
    {
      icon: Vote,
      title: 'Votar',
      description:
        'Financiadores validam cada milestone antes da liberacao de recursos.',
    },
    {
      icon: GitCommitVertical,
      title: 'Liberar ou devolver',
      description:
        'Se a etapa for aceita, o pagamento segue; se falhar, o capital volta.',
    },
  ],
  features: [
    {
      icon: ShieldCheck,
      title: 'Custodia por etapa',
      description:
        'O dinheiro nunca vai direto ao pesquisador. Ele fica condicionado a entregas verificaveis.',
      tone: 'cyan' as const,
    },
    {
      icon: Sparkles,
      title: 'IA explicavel',
      description:
        'Propostas e entregas viram resumos claros, com sinais de risco e viabilidade.',
      tone: 'green' as const,
    },
    {
      icon: Vote,
      title: 'DAO simples',
      description:
        'A comunidade financia e vota sem precisar entender todo o paper tecnico.',
      tone: 'purple' as const,
    },
    {
      icon: Network,
      title: 'Solana first',
      description:
        'Arquitetura pensada para wallets, baixo custo e execucao rapida on-chain.',
      tone: 'cyan' as const,
    },
    {
      icon: Coins,
      title: 'USDC ready',
      description:
        'Valores modelados com precisao decimal para funding em stablecoin.',
      tone: 'green' as const,
    },
    {
      icon: Landmark,
      title: 'Sem intermediarios',
      description:
        'Regras transparentes substituem processos manuais e gatekeepers opacos.',
      tone: 'purple' as const,
    },
  ],
}
