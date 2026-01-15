export interface ProjectTemplate {
  id: string;
  title: string;
  category: 'work' | 'personal' | 'creative' | 'learning';
  description: string;
  charter: string;
  deliverableA: string;
  deliverableB: string;
  deliverableC: string;
  tasks: Array<{
    title: string;
    dayNumber: number;
    estimatedMinutes: number;
  }>;
  popular?: boolean;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'launch-digital-product',
    title: 'Lançar Produto Digital',
    category: 'work',
    description: 'Planeje e execute o lançamento de um produto digital, app ou SaaS do zero até o MVP',
    charter: 'Criar e lançar um produto digital (app, SaaS ou plataforma) validando a ideia com early adopters e atingindo as primeiras vendas ou usuários pagantes. O objetivo é ir do conceito ao MVP funcional em 3 semanas, priorizando validação rápida sobre perfeição.',
    deliverableA: 'MVP funcional com 1-2 funcionalidades core, hospedado e acessível via link público. Ao menos 10 usuários beta testaram e deram feedback.',
    deliverableB: 'Produto com 3-5 funcionalidades essenciais, landing page profissional, sistema de pagamento integrado e 50+ usuários cadastrados.',
    deliverableC: 'Produto completo com onboarding polido, analytics configurado, primeiros 10 clientes pagantes e documentação técnica.',
    tasks: [
      { title: 'Definir problema e solução em uma frase', dayNumber: 1, estimatedMinutes: 30 },
      { title: 'Listar 3-5 funcionalidades essenciais do MVP', dayNumber: 1, estimatedMinutes: 45 },
      { title: 'Criar wireframe básico no papel ou Figma', dayNumber: 1, estimatedMinutes: 60 },
      { title: 'Configurar ambiente de desenvolvimento', dayNumber: 2, estimatedMinutes: 90 },
      { title: 'Implementar funcionalidade core #1', dayNumber: 2, estimatedMinutes: 180 },
      { title: 'Implementar funcionalidade core #2', dayNumber: 3, estimatedMinutes: 180 },
      { title: 'Deploy inicial em staging', dayNumber: 3, estimatedMinutes: 60 },
    ],
    popular: true
  },
  {
    id: 'write-article-report',
    title: 'Escrever Artigo ou Relatório',
    category: 'creative',
    description: 'Estruture e escreva um artigo, post de blog, relatório ou documento técnico completo',
    charter: 'Escrever e publicar um artigo, relatório ou documento de 1.500 a 3.000 palavras sobre um tema específico, com pesquisa adequada, estrutura clara e revisão profissional. O objetivo é entregar conteúdo de qualidade que possa ser publicado ou apresentado.',
    deliverableA: 'Rascunho completo de 1.500 palavras com introdução, desenvolvimento e conclusão. Estrutura básica definida e ideias principais desenvolvidas.',
    deliverableB: 'Artigo de 2.000-2.500 palavras revisado, com referências citadas, imagens ou gráficos relevantes e formatação adequada.',
    deliverableC: 'Documento final de 3.000 palavras polido, revisado por terceiros, com SEO otimizado (se for blog) ou formatação profissional (se for relatório).',
    tasks: [
      { title: 'Definir tema e tese principal do artigo', dayNumber: 1, estimatedMinutes: 30 },
      { title: 'Criar outline com 3-5 seções principais', dayNumber: 1, estimatedMinutes: 45 },
      { title: 'Pesquisar e coletar 5-10 referências', dayNumber: 1, estimatedMinutes: 90 },
      { title: 'Escrever introdução (200-300 palavras)', dayNumber: 2, estimatedMinutes: 60 },
      { title: 'Desenvolver seção 1', dayNumber: 2, estimatedMinutes: 90 },
      { title: 'Desenvolver seção 2', dayNumber: 2, estimatedMinutes: 90 },
      { title: 'Desenvolver seção 3', dayNumber: 3, estimatedMinutes: 90 },
      { title: 'Escrever conclusão', dayNumber: 3, estimatedMinutes: 60 },
    ],
    popular: true
  },
  {
    id: 'organize-event',
    title: 'Organizar Evento',
    category: 'personal',
    description: 'Planeje todos os detalhes de um evento pessoal ou profissional (festa, workshop, reunião)',
    charter: 'Organizar e executar um evento (festa de aniversário, workshop, reunião de equipe, etc.) cuidando de todos os aspectos logísticos: local, convidados, alimentação, atividades e cronograma. O objetivo é garantir que o evento aconteça sem imprevistos e com boa experiência para os participantes.',
    deliverableA: 'Data definida, local reservado, lista de convidados criada e convites enviados. Orçamento básico calculado.',
    deliverableB: 'Todos os fornecedores contratados (buffet, decoração, etc.), cronograma detalhado do evento criado, confirmações de presença recebidas.',
    deliverableC: 'Evento executado com sucesso, fotos documentadas, feedback dos participantes coletado e agradecimentos enviados.',
    tasks: [
      { title: 'Definir data, horário e duração do evento', dayNumber: 1, estimatedMinutes: 30 },
      { title: 'Escolher e reservar local', dayNumber: 1, estimatedMinutes: 90 },
      { title: 'Criar lista de convidados', dayNumber: 1, estimatedMinutes: 45 },
      { title: 'Definir orçamento total e por categoria', dayNumber: 2, estimatedMinutes: 60 },
      { title: 'Pesquisar e contratar buffet/alimentação', dayNumber: 2, estimatedMinutes: 120 },
      { title: 'Criar e enviar convites', dayNumber: 2, estimatedMinutes: 60 },
      { title: 'Planejar decoração e ambientação', dayNumber: 3, estimatedMinutes: 90 },
    ]
  },
  {
    id: 'home-renovation',
    title: 'Reformar Casa ou Cômodo',
    category: 'personal',
    description: 'Gerencie uma reforma residencial do planejamento à execução',
    charter: 'Planejar e executar a reforma de um cômodo ou área da casa, incluindo definição de escopo, orçamento, contratação de profissionais e acompanhamento da obra. O objetivo é concluir a reforma dentro do prazo e orçamento, com qualidade satisfatória.',
    deliverableA: 'Escopo da reforma definido, 3 orçamentos de diferentes profissionais recebidos e profissional contratado. Cronograma básico acordado.',
    deliverableB: 'Reforma 70% concluída, materiais adquiridos, obra em andamento conforme cronograma. Registro fotográfico do progresso.',
    deliverableC: 'Reforma 100% finalizada, ambiente limpo e organizado, garantias documentadas e check-list de qualidade aprovado.',
    tasks: [
      { title: 'Listar todas as mudanças desejadas', dayNumber: 1, estimatedMinutes: 60 },
      { title: 'Definir orçamento máximo para a reforma', dayNumber: 1, estimatedMinutes: 30 },
      { title: 'Pesquisar e solicitar orçamentos de 3 profissionais', dayNumber: 1, estimatedMinutes: 90 },
      { title: 'Comparar orçamentos e escolher profissional', dayNumber: 2, estimatedMinutes: 60 },
      { title: 'Definir cronograma detalhado com profissional', dayNumber: 2, estimatedMinutes: 45 },
      { title: 'Comprar materiais necessários', dayNumber: 2, estimatedMinutes: 180 },
      { title: 'Acompanhar primeira semana de obra', dayNumber: 3, estimatedMinutes: 120 },
    ]
  },
  {
    id: 'plan-trip',
    title: 'Planejar Viagem',
    category: 'personal',
    description: 'Organize todos os detalhes de uma viagem de férias ou trabalho',
    charter: 'Planejar uma viagem completa incluindo transporte, hospedagem, roteiro de atividades, orçamento e documentação necessária. O objetivo é garantir uma viagem organizada, dentro do orçamento e sem imprevistos logísticos.',
    deliverableA: 'Destino escolhido, datas definidas, passagens e hospedagem reservadas. Orçamento básico calculado.',
    deliverableB: 'Roteiro dia a dia criado, principais atrações reservadas (quando necessário), documentação verificada (passaporte, visto, vacinas).',
    deliverableC: 'Viagem executada conforme planejado, registro fotográfico feito, despesas rastreadas e memórias documentadas.',
    tasks: [
      { title: 'Definir destino e período da viagem', dayNumber: 1, estimatedMinutes: 45 },
      { title: 'Pesquisar e comparar opções de voos/transporte', dayNumber: 1, estimatedMinutes: 90 },
      { title: 'Pesquisar e reservar hospedagem', dayNumber: 1, estimatedMinutes: 90 },
      { title: 'Criar orçamento detalhado da viagem', dayNumber: 2, estimatedMinutes: 60 },
      { title: 'Listar atrações e atividades desejadas', dayNumber: 2, estimatedMinutes: 60 },
      { title: 'Criar roteiro dia a dia', dayNumber: 2, estimatedMinutes: 90 },
      { title: 'Verificar documentos necessários', dayNumber: 3, estimatedMinutes: 45 },
    ],
    popular: true
  }
];
