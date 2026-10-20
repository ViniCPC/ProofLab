import {
  AlertTriangle,
  ArrowDownToLine,
  Bot,
  CircleDollarSign,
  FlaskConical,
  Landmark,
  LockKeyhole,
  Network,
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
      { href: '#problema', label: 'Por que ProofLab' },
      { href: '#como-funciona', label: 'Como funciona' },
      { href: '#produto', label: 'Produto' },
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
    browserLabel: 'Exemplo de interface',
    projectTitle: 'Sensoriamento de rios urbanos',
    projectDescription: 'Pesquisa de exemplo · fluxo ilustrativo',
    escrowLabel: 'Exemplo de fluxo',
    statusLabel: 'Ilustrativo',
    stageLabel: 'Etapa atual',
    stages: [
      { label: 'Proposta', status: 'Concluída' },
      { label: 'Financiamento', status: 'Em análise' },
      { label: 'Evidências', status: 'A seguir' },
      { label: 'Votação', status: 'A seguir' },
      { label: 'Liberação', status: 'A seguir' },
    ],
  },
  trustBadges: [
    { label: 'Solana', icon: Network },
    { label: 'USDC', icon: CircleDollarSign },
    { label: 'Código aberto', icon: LockKeyhole },
    { label: 'Transações verificáveis', icon: ShieldCheck },
  ],
  problemSolution: {
    eyebrow: 'Por que ProofLab',
    title: 'O financiamento científico não precisa ser uma caixa-preta.',
    description:
      'Transformamos confiança em regras que qualquer pessoa consegue acompanhar.',
    items: [
      {
        icon: AlertTriangle,
        problem: 'Capital sem rastreabilidade',
        solution: 'Escrow on-chain mantém o dinheiro condicionado ao plano aprovado.',
        tone: 'orange' as const,
      },
      {
        icon: Bot,
        problem: 'Resultados difíceis de entender',
        solution:
          'IA resume evidências e sinaliza riscos sem substituir o julgamento humano.',
        tone: 'purple' as const,
      },
      {
        icon: Network,
        problem: 'Decisões concentradas',
        solution:
          'Financiadores votam etapa por etapa, com peso proporcional ao apoio.',
        tone: 'cyan' as const,
      },
    ],
  },
  product: {
    eyebrow: 'Produto na prática',
    title: 'Veja a proposta como uma experiência, não como uma promessa.',
    description:
      'A interface abaixo é uma representação visual do fluxo. Explore pesquisas públicas para ver o restante da experiência no aplicativo.',
    cta: 'Explorar pesquisa de exemplo',
    note: 'Os dados exibidos neste painel são ilustrativos e não representam saldo real.',
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
        visual: 'progress' as const,
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
      'A ProofLab roda em Solana Devnet e ainda não foi auditada. Use valores de teste e revise o código antes de confiar capital real.',
    rules: [
      'O pesquisador não controla o escrow diretamente.',
      'A comunidade vota em cada etapa submetida.',
      'Uma etapa rejeitada abre o caminho para reembolso proporcional.',
    ],
    programLabel: 'Programa Solana',
    disclaimer: 'Devnet · não auditado',
    explorerLabel: 'Ver no Explorer',
  },
  faq: {
    eyebrow: 'Perguntas frequentes',
    title: 'Comece sem precisar decorar cripto.',
    items: [
      {
        question: 'Preciso de cripto?',
        answer:
          'Para financiar uma pesquisa, você precisa de uma wallet compatível com Solana e USDC de Devnet. A landing pode ser explorada sem conectar nada.',
      },
      {
        question: 'Quem controla o dinheiro?',
        answer:
          'O programa de escrow controla as regras de custódia. O pesquisador só recebe quando a etapa é liberada pelo fluxo on-chain.',
      },
      {
        question: 'E se o pesquisador sumir?',
        answer:
          'Se a etapa atual passar do prazo sem submissão, qualquer pessoa pode iniciar o cancelamento. Depois disso, os financiadores podem solicitar o reembolso proporcional do saldo disponível.',
      },
    ],
  },
  cta: {
    eyebrow: 'Conheça o projeto',
    title: 'Veja como a ProofLab torna o financiamento verificável.',
    description:
      'A apresentação mostra o caminho completo: proposta, escrow, evidência, voto e liberação.',
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
    disclaimer: 'Devnet · não auditado',
    copyright: 'ProofLab. Feito para ciência aberta.',
  },
} as const
