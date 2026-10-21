import {
  ArrowDownToLine,
  Bot,
  CircleDollarSign,
  FlaskConical,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Vote,
  WalletCards,
} from 'lucide-react'

const githubUrl = 'https://github.com/ViniCPC/ProofLab'
const presentationVideoUrl = import.meta.env.VITE_PRESENTATION_VIDEO_URL?.trim()
const presentationLabel = presentationVideoUrl
  ? 'Ver apresentação'
  : 'Ver código no GitHub'

export const landingContent = {
  nav: {
    links: [
      { href: '#como-funciona', label: 'Como funciona' },
      { href: '#recursos', label: 'Recursos' },
      { href: '#confianca', label: 'Confiança' },
      { href: '#faq', label: 'FAQ' },
    ],
    appCta: 'Abrir app',
    menuLabel: 'Abrir menu',
    closeLabel: 'Fechar menu',
  },
  hero: {
    eyebrow: 'Financiamento científico verificável',
    title: 'Financie ciência. Acompanhe cada etapa.',
    description:
      'A ProofLab conecta pesquisadores e financiadores em um escrow Solana, com evidências, análise contextual e votação antes de cada liberação.',
    primaryCta: 'Explorar pesquisas',
    secondaryCta: 'Criar pesquisa',
  },
  productShot: {
    browserLabel: 'ProofLab · pesquisa',
    projectTitle: 'Sensoriamento de rios urbanos',
    projectDescription: 'Pesquisa aplicada · financiamento por etapas',
    escrowLabel: 'Fluxo do projeto',
    statusLabel: 'Em andamento',
    stageLabel: 'Etapa atual',
    disclaimer: 'Visual de exemplo',
    stages: [
      { label: 'Proposta', status: 'Concluída' },
      { label: 'Financiamento', status: 'Em análise' },
      { label: 'Evidências', status: 'A seguir' },
      { label: 'Votação', status: 'A seguir' },
      { label: 'Liberação', status: 'A seguir' },
    ],
    doneLabel: 'Concluída',
    nextLabel: 'A seguir',
    scenes: [
      {
        browserLabel: 'ProofLab · criar pesquisa',
        statusLabel: 'Rascunho',
        stageStatus: 'Proposta publicada',
        eyebrow: 'Prévia da pesquisa',
        title: 'Etapas e orçamento',
        aiBadge: 'IA pronta para análise',
        totalLabel: 'Meta total',
        total: 12000,
        allocatedLabel: 'Etapas alocadas',
        milestones: [
          { title: 'Coleta de campo', amount: 4000 },
          { title: 'Análise laboratorial', amount: 5000 },
          { title: 'Relatório público', amount: 3000 },
        ],
      },
      {
        browserLabel: 'ProofLab · financiar',
        statusLabel: 'Funding',
        stageStatus: 'Aportes abertos',
        eyebrow: 'funding',
        title: 'Progresso financeiro',
        goalLabel: 'Meta total',
        goal: 12000,
        raisedLabel: 'Arrecadado',
        raised: 8400,
        progressLabel: 'Financiado',
        lastWallet: '7xKpQa9mR2vT8nLwE4sJ6dHcY1bZ3fQa21',
        lastFunder: 'Instituto Águas Vivas',
        lastAmount: 250,
      },
      {
        browserLabel: 'ProofLab · revisão',
        statusLabel: 'Em revisão',
        stageStatus: 'Evidências enviadas',
        title: 'Revisão da IA',
        milestone: 'Etapa 1 · Coleta de campo',
        summary:
          'Relatório com dataset de 14 pontos de coleta e laudo laboratorial anexado.',
        completionLabel: 'Estimativa de conclusão',
        completion: 90,
        consistencyLabel: 'Score de consistência',
        consistency: 82,
        recommendationLabel: 'Recomendação',
        recommendation: 'Evidências consistentes com o escopo da etapa.',
      },
      {
        browserLabel: 'ProofLab · votação',
        statusLabel: 'Em revisão',
        stageStatus: 'Votação aberta',
        title: 'Votação DAO',
        milestone: 'Etapa 1: Coleta de campo',
        badge: 'Em revisão',
        votes: { total: 32, approved: 25, rejected: 7 },
      },
      {
        browserLabel: 'ProofLab · liberação',
        statusLabel: 'Aprovada',
        stageStatus: 'Fundos liberados',
        title: 'Liberar fundos',
        milestone: 'Etapa 1',
        amount: 4000,
        badge: 'Aprovada',
        toastTitle: 'Fundos liberados',
        toastMessage: 'Release confirmado on-chain.',
        signature:
          '5Hq2xVb8NcLm3RtY7kPw9JdF4sGzA6eUoQ1iTnBhXyC2vM8rKjL5pWq7ZaE3fD9tWd',
      },
    ],
  },
  howItWorks: {
    eyebrow: 'Fluxo verificável',
    title: 'Da proposta à liberação, cada etapa deixa uma trilha.',
    description: 'O contrato executa as regras; a comunidade acompanha o contexto.',
    steps: [
      {
        icon: FlaskConical,
        title: 'Criar',
        description: 'O pesquisador publica a proposta, orçamento e etapas.',
      },
      {
        icon: WalletCards,
        title: 'Financiar',
        description: 'A comunidade aporta USDC diretamente no escrow do projeto.',
      },
      {
        icon: Bot,
        title: 'Revisar',
        description:
          'A IA organiza a entrega e destaca evidências para leitura rápida.',
      },
      {
        icon: Vote,
        title: 'Votar',
        description: 'Financiadores avaliam cada etapa antes da liberação.',
      },
      {
        icon: ArrowDownToLine,
        title: 'Liberar ou devolver',
        description:
          'O contrato libera a etapa aprovada ou calcula o reembolso proporcional.',
      },
    ],
  },
  features: {
    eyebrow: 'Regras do contrato',
    title: 'Menos promessa. Mais estado verificável.',
    items: [
      {
        icon: Vote,
        title: 'Voto ponderado',
        description: 'O peso acompanha o valor contribuído, sem votação simbólica.',
        tone: 'purple' as const,
        visual: 'vote' as const,
      },
      {
        icon: ShieldCheck,
        title: 'Owner não vota',
        description: 'Quem pesquisa não pode aprovar a própria etapa on-chain.',
        tone: 'cyan' as const,
        visual: 'icon' as const,
      },
      {
        icon: CircleDollarSign,
        title: 'Reembolso proporcional',
        description: 'Se uma etapa falhar, o saldo disponível volta proporcionalmente.',
        tone: 'green' as const,
        visual: 'icon' as const,
      },
      {
        icon: LockKeyhole,
        title: 'Escrow por etapa',
        description:
          'Cada liberação depende do estado da entrega e do voto registrado.',
        tone: 'cyan' as const,
        visual: 'icon' as const,
      },
      {
        icon: Sparkles,
        title: 'IA como contexto',
        description: 'A análise acelera a leitura, mas a decisão continua auditável.',
        tone: 'green' as const,
        visual: 'ai' as const,
      },
      {
        icon: Landmark,
        title: 'Regras públicas',
        description:
          'O programa Solana e seus estados ficam disponíveis para verificação.',
        tone: 'purple' as const,
        visual: 'icon' as const,
      },
    ],
  },
  audience: {
    eyebrow: 'Escolha seu papel',
    title: 'Uma camada de confiança para os dois lados.',
    researcher: {
      title: 'Sou pesquisador',
      description:
        'Estruture sua proposta, mostre progresso e receba capital conforme entrega valor.',
      cta: 'Publicar pesquisa',
    },
    funder: {
      title: 'Quero financiar',
      description:
        'Descubra ciência promissora, entenda os riscos e acompanhe cada decisão do escrow.',
      cta: 'Encontrar projetos',
    },
  },
  trust: {
    eyebrow: 'Confiança verificável',
    title: 'O contrato é a regra do jogo.',
    description:
      'A ProofLab registra regras e estados do projeto em Solana Devnet para consulta pública.',
    rules: [
      'O pesquisador não controla o escrow diretamente.',
      'A comunidade vota em cada etapa submetida.',
      'Uma etapa rejeitada abre o caminho para reembolso proporcional.',
    ],
    programLabel: 'Programa Solana',
    explorerLabel: 'Ver no Explorer',
  },
  faq: {
    eyebrow: 'Perguntas frequentes',
    title: 'Entenda como funciona antes de participar.',
    description:
      'Veja como a ProofLab organiza financiamento, evidências, votação e reembolso.',
    items: [
      {
        question: 'O que é a ProofLab?',
        answer:
          'A ProofLab é uma plataforma para organizar financiamento científico por etapas. Pesquisadores apresentam uma proposta, financiadores acompanham as evidências e a comunidade decide quando uma etapa pode ser liberada.',
      },
      {
        question: 'Preciso de uma wallet ou de cripto para explorar a plataforma?',
        answer:
          'Não. Você pode conhecer a plataforma, ler pesquisas e explorar a interface sem conectar uma wallet. Para participar de uma contribuição de teste, a wallet é a carteira digital usada para assinar a transação e o USDC é o token de teste usado na Solana Devnet.',
      },
      {
        question: 'Como os recursos ficam protegidos?',
        answer:
          'As contribuições ficam em um escrow, que é uma custódia automática com regras públicas. O pesquisador não movimenta esse saldo diretamente: o programa on-chain, isto é, executado na rede Solana, registra as condições para liberar ou devolver os recursos.',
      },
      {
        question: 'Quem decide se uma etapa deve ser liberada?',
        answer:
          'A decisão final vem da votação dos financiadores elegíveis. O peso do voto acompanha o valor contribuído, e o pesquisador não pode votar na própria etapa.',
      },
      {
        question: 'A IA aprova uma pesquisa ou entrega?',
        answer:
          'Não. A IA apenas organiza e resume evidências, além de destacar pontos que merecem atenção. Ela não aprova pesquisa, não libera recursos e não substitui a decisão da votação.',
      },
      {
        question: 'O que acontece se o pesquisador não entregar uma etapa?',
        answer:
          'O pesquisador pode cancelar o projeto, e os financiadores recebem de volta, de forma proporcional, o saldo que ainda estiver no escrow.',
      },
      {
        question: 'Posso usar dinheiro real?',
        answer:
          'Não use dinheiro real. O projeto está em Solana Devnet, uma rede de testes, e as contribuições da experiência não transferem dinheiro real. O reembolso depende do saldo disponível no escrow.',
      },
    ],
  },
  cta: {
    eyebrow: presentationVideoUrl ? 'Conheça o projeto' : 'Código aberto',
    title: presentationVideoUrl
      ? 'Veja como a ProofLab torna o financiamento verificável.'
      : 'Revise como o fluxo verificável foi implementado.',
    description: presentationVideoUrl
      ? 'A apresentação mostra o caminho completo: proposta, escrow, evidência, voto e liberação.'
      : 'O repositório reúne frontend, API e programa Solana para consulta.',
    button: presentationLabel,
    videoUrl: presentationVideoUrl || githubUrl,
  },
  footer: {
    description: 'Financiamento científico com regras que podem ser verificadas.',
    columns: [
      {
        title: 'Produto',
        links: [
          { label: 'Explorar pesquisas', href: '/explore' },
          { label: 'Criar pesquisa', href: '/create' },
        ],
      },
      {
        title: 'Projeto',
        links: [
          { label: 'GitHub', href: githubUrl },
          { label: 'API', href: 'https://prooflab-9ffw.onrender.com/docs' },
        ],
      },
      {
        title: 'Links',
        links: [
          { label: presentationLabel, href: presentationVideoUrl || githubUrl },
          { label: 'Confiança', href: '#confianca' },
        ],
      },
    ],
    network: 'Rede: Solana Devnet',
    copyright: 'ProofLab. Feito para ciência aberta.',
  },
} as const
