# GUIA COMPLETO DO NEUROEXECUÇÃO
## Para Não-Programadores

**Versão:** 2.0 - Atualizado em 13 de Janeiro de 2026  
**Autor:** Manus AI  
**Site:** https://neuroplan-4wuusrck.manus.space

---

## 📖 ÍNDICE

1. [O que é o NeuroExecução?](#o-que-é-o-neuroexecução)
2. [Como Funciona? (Visão Geral)](#como-funciona-visão-geral)
3. [Funcionalidades Completas](#funcionalidades-completas)
4. [Tecnologias Usadas (Front-end e Back-end)](#tecnologias-usadas)
5. [Segredos e Chaves (APIs)](#segredos-e-chaves-apis)
6. [Como Conectar Tudo](#como-conectar-tudo)
7. [Estrutura de Pastas](#estrutura-de-pastas)
8. [Perguntas Frequentes](#perguntas-frequentes)

---

## 🧠 O QUE É O NEUROEXECUÇÃO?

O **NeuroExecução** é um sistema de gestão de projetos especialmente desenhado para pessoas com TDAH (Transtorno de Déficit de Atenção e Hiperatividade). Ele ajuda você a **concluir projetos** que normalmente ficam pela metade, usando princípios científicos de Russell Barkley, um dos maiores especialistas em TDAH do mundo.

### Por que ele existe?

Pessoas com TDAH enfrentam desafios específicos:
- **Paralisia do TDAH:** Saber o que fazer, mas não conseguir começar
- **Memória de trabalho limitada:** Esquecer o que estava fazendo após uma interrupção
- **Miopia temporal:** Dificuldade em visualizar o futuro distante
- **Motivação flutuante:** Energia mental que varia muito ao longo do dia

O NeuroExecução foi criado para **atacar cada um desses problemas** com soluções práticas.

---

## 🔄 COMO FUNCIONA? (VISÃO GERAL)

O NeuroExecução funciona em **3 camadas**:

### 1. **Front-end** (O que você vê)
É a interface visual do site que você acessa no navegador. Aqui você:
- Cria projetos
- Vê suas tarefas
- Usa o timer de foco
- Acompanha seu progresso no "Jardim do Foco"

**Tecnologia:** React (biblioteca JavaScript para criar interfaces)

### 2. **Back-end** (O cérebro do sistema)
É o servidor que processa tudo nos bastidores. Ele:
- Salva seus dados no banco de dados
- Usa Inteligência Artificial para quebrar projetos em tarefas
- Calcula seu progresso
- Gerencia pagamentos via Stripe

**Tecnologia:** Node.js + Express (servidor JavaScript)

### 3. **Banco de Dados** (A memória do sistema)
É onde tudo fica guardado:
- Seus projetos
- Suas tarefas
- Seu progresso
- Suas configurações

**Tecnologia:** MySQL (banco de dados relacional)

---

## ⚙️ FUNCIONALIDADES COMPLETAS

### 🎯 1. Sistema de Ciclos de 3 Dias

**O que faz:**  
Quebra qualquer projeto em ciclos curtos de 3 dias. Cada dia tem 3 tarefas: A (mínima), B (ideal) e C (bônus).

**Por que funciona:**  
Pessoas com TDAH têm dificuldade em visualizar o futuro distante (miopia temporal). Ciclos de 3 dias mantêm as recompensas sempre próximas e visíveis.

**Como usar:**
1. Descreva seu projeto em 3 frases
2. A IA quebra em um ciclo de 3 dias
3. Você vê apenas as tarefas de hoje
4. Amanhã, novas tarefas aparecem automaticamente

---

### 🧠 2. IA para Decomposição de Tarefas

**O que faz:**  
Usa Inteligência Artificial para transformar tarefas grandes e assustadoras em passos pequenos e acionáveis.

**Exemplo:**
- **Tarefa grande:** "Declarar Imposto de Renda"
- **IA quebra em:**
  - A: Separar os informes de rendimento (15 min)
  - B: Preencher dados pessoais no site da Receita (20 min)
  - C: Revisar declaração com contador (30 min)

**Tecnologia usada:**  
OpenAI GPT-4 (via Manus Forge API)

---

### 📍 3. Painel "Onde Parei"

**O que faz:**  
Externaliza sua memória de trabalho. Quando você volta ao sistema após uma interrupção, ele te mostra exatamente onde você parou.

**O que aparece:**
- Última tarefa que você estava fazendo
- Progresso nela (ex: 50% concluído)
- Próximo passo sugerido

**Por que funciona:**  
A memória de trabalho de quem tem TDAH é limitada. Guardar contexto mentalmente é exaustivo. O painel faz isso por você.

---

### ⏱️ 4. Timer de Foco Progressivo

**O que faz:**  
Um timer que começa com sessões curtas (5 minutos) e vai aumentando conforme você ganha confiança.

**Como funciona:**
1. **Dia 1:** 5 minutos de foco
2. **Dia 2:** 10 minutos
3. **Dia 3:** 15 minutos
4. **Dia 7:** 25 minutos (Pomodoro clássico)

**Por que funciona:**  
Começar com 25 minutos é intimidante. 5 minutos é fácil de começar. O timer cresce com você.

---

### 🌱 5. Jardim do Foco (Gamificação)

**O que faz:**  
Visualiza seu progresso como plantas que crescem. Cada ciclo completado = 1 planta.

**3 Estágios:**
- 🌱 **Semente** (0-2 ciclos)
- 🌸 **Broto** (3-5 ciclos)
- 🌳 **Árvore** (6+ ciclos)

**Mensagem motivacional:**  
"Ciclos não concluídos não matam suas plantas, elas apenas esperam por você."

**Por que funciona:**  
Pessoas com TDAH precisam de recompensas visuais rápidas. Ver plantas crescendo dá uma dose de dopamina que mantém a motivação.

---

### 💳 6. Sistema de Pagamentos (Stripe)

**O que faz:**  
Gerencia assinaturas mensais dos planos Pro e Equipe.

**Planos:**
- **Gratuito:** R$ 0/mês (1 projeto, sem IA)
- **Pro:** R$ 49,90/mês (projetos ilimitados, IA, relatórios)
- **Equipe:** R$ 149,90/mês (até 10 membros, dashboard de equipe)

**Como funciona:**
1. Você clica em "Teste o Pro por 7 Dias Grátis"
2. É redirecionado para o Stripe (processador de pagamentos)
3. Insere os dados do cartão
4. Após 7 dias, é cobrado automaticamente

**Tecnologia:** Stripe (plataforma de pagamentos)

---

### 📊 7. Relatórios de Progresso

**O que faz:**  
Mostra estatísticas sobre sua produtividade:
- Ciclos completados
- Taxa de conclusão de tarefas
- Tempo focado (minutos)
- Projetos ativos

**Por que funciona:**  
Ver seu progresso em números reforça a sensação de conquista e te motiva a continuar.

---

### 🔔 8. Notificações Inteligentes

**O que faz:**  
Envia lembretes no momento certo:
- "Hora de começar sua tarefa A"
- "Você está a 1 tarefa de completar o ciclo!"
- "Seu jardim cresceu! 🌱"

**Como funciona:**  
Usa o sistema de notificações do Manus Forge (Push Notifications).

---

### 📝 9. Quick Ideas (Ideias Rápidas)

**O que faz:**  
Um bloco de notas rápido para capturar ideias que surgem no meio do dia, sem interromper seu foco.

**Como usar:**
1. Clica no botão "Quick Idea"
2. Escreve a ideia em 1 frase
3. Ela fica salva para você revisar depois

**Por que funciona:**  
Pessoas com TDAH têm muitas ideias ao longo do dia. Se não capturar, elas se perdem. Quick Ideas evita isso sem te tirar do foco.

---

### 📅 10. Exportação para Google Calendar

**O que faz:**  
Exporta suas tarefas para o Google Calendar, para você ver no seu calendário pessoal.

**Como funciona:**
1. Clica em "Exportar para Calendar"
2. Autoriza o acesso ao Google
3. Suas tarefas aparecem como eventos no calendário

---

## 🛠️ TECNOLOGIAS USADAS

### Front-end (Interface Visual)

| Tecnologia | O que faz | Por que usamos |
|------------|-----------|----------------|
| **React** | Biblioteca para criar interfaces | Rápida, moderna e fácil de atualizar |
| **TypeScript** | JavaScript com tipos | Evita erros e torna o código mais seguro |
| **Tailwind CSS** | Framework de estilos | Design bonito e responsivo (funciona em celular) |
| **Framer Motion** | Animações | Torna a interface mais fluida e agradável |
| **Wouter** | Navegação entre páginas | Leve e rápido |
| **Radix UI** | Componentes acessíveis | Botões, modais e menus prontos |
| **React Hook Form** | Formulários | Facilita a criação de formulários (ex: criar projeto) |
| **Zod** | Validação de dados | Garante que os dados estão corretos antes de enviar |

---

### Back-end (Servidor)

| Tecnologia | O que faz | Por que usamos |
|------------|-----------|----------------|
| **Node.js** | Ambiente JavaScript no servidor | Rápido e escalável |
| **Express** | Framework para criar APIs | Facilita a criação de rotas (ex: /api/projects) |
| **tRPC** | Comunicação front-end ↔ back-end | Type-safe (sem erros de tipo) |
| **Drizzle ORM** | Acesso ao banco de dados | Facilita salvar e buscar dados |
| **MySQL** | Banco de dados relacional | Confiável e rápido |
| **Stripe** | Processamento de pagamentos | Seguro e usado por milhões de empresas |
| **OpenAI API** | Inteligência Artificial | Quebra tarefas e gera sugestões |

---

### Infraestrutura (Hospedagem)

| Serviço | O que faz |
|---------|-----------|
| **Manus Forge** | Hospedagem completa (servidor + banco + deploy) |
| **GitHub** | Controle de versão (histórico de mudanças) |
| **Cloudflare** | CDN (acelera o site globalmente) |
| **TiDB Cloud** | Banco de dados MySQL gerenciado |

---

## 🔐 SEGREDOS E CHAVES (APIs)

Estas são as **credenciais** que o NeuroExecução precisa para funcionar. Elas ficam armazenadas de forma segura no **Manus Forge** (não no código).

### 1. **Stripe (Pagamentos)**

| Chave | O que faz | Onde conseguir |
|-------|-----------|----------------|
| `STRIPE_SECRET_KEY` | Processa pagamentos | Dashboard do Stripe → API Keys |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Conecta front-end ao Stripe | Dashboard do Stripe → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Recebe notificações de pagamento | Dashboard do Stripe → Webhooks |

**Como configurar:**
1. Acesse https://dashboard.stripe.com
2. Vá em "Developers" → "API Keys"
3. Copie as chaves e cole no Manus Forge (Settings → Secrets)

---

### 2. **OpenAI (Inteligência Artificial)**

| Chave | O que faz | Onde conseguir |
|-------|-----------|----------------|
| `BUILT_IN_FORGE_API_KEY` | Usa IA do Manus Forge | Já configurado automaticamente |
| `BUILT_IN_FORGE_API_URL` | URL da API | Já configurado automaticamente |

**Nota:** O Manus Forge já fornece acesso à OpenAI. Você não precisa criar uma conta separada.

---

### 3. **Google Analytics (Métricas)**

| Chave | O que faz | Onde conseguir |
|-------|-----------|----------------|
| `VITE_GA_MEASUREMENT_ID` | Rastreia visitantes | Google Analytics → Admin → Data Streams |

**Como configurar:**
1. Acesse https://analytics.google.com
2. Crie uma propriedade
3. Copie o Measurement ID (ex: G-XXXXXXXXXX)
4. Cole no Manus Forge (Settings → Secrets)

---

### 4. **Database (Banco de Dados)**

| Chave | O que faz | Onde conseguir |
|-------|-----------|----------------|
| `DATABASE_URL` | Conecta ao MySQL | Manus Forge → Database → Connection Info |

**Formato:**
```
mysql://usuario:senha@host:porta/nome_do_banco
```

**Nota:** O Manus Forge já configura isso automaticamente.

---

### 5. **Manus Auth (Autenticação)**

| Chave | O que faz | Onde conseguir |
|-------|-----------|----------------|
| `VITE_OAUTH_PORTAL_URL` | URL de login | Já configurado automaticamente |
| `VITE_APP_ID` | ID do app no Manus | Já configurado automaticamente |
| `JWT_SECRET` | Segredo para tokens | Já configurado automaticamente |

**Nota:** O Manus Forge gerencia autenticação automaticamente. Você não precisa configurar nada.

---

## 🔌 COMO CONECTAR TUDO

### Passo 1: Criar Conta no Stripe

1. Acesse https://stripe.com
2. Crie uma conta
3. Vá em "Developers" → "API Keys"
4. Copie:
   - **Secret Key** (começa com `sk_`)
   - **Publishable Key** (começa com `pk_`)

### Passo 2: Configurar Webhook do Stripe

1. No Stripe, vá em "Developers" → "Webhooks"
2. Clique em "Add endpoint"
3. URL: `https://neuroplan-4wuusrck.manus.space/api/stripe/webhook`
4. Eventos: Selecione todos os eventos de `checkout` e `customer`
5. Copie o **Webhook Secret** (começa com `whsec_`)

### Passo 3: Adicionar Chaves no Manus Forge

1. Acesse https://manus.im
2. Vá para o projeto NeuroExecução
3. Clique em "Settings" → "Secrets"
4. Adicione:
   - `STRIPE_SECRET_KEY` = (cole a Secret Key)
   - `VITE_STRIPE_PUBLISHABLE_KEY` = (cole a Publishable Key)
   - `STRIPE_WEBHOOK_SECRET` = (cole o Webhook Secret)

### Passo 4: Criar Produtos no Stripe

1. No Stripe, vá em "Products"
2. Crie 2 produtos:
   - **Pro:** R$ 49,90/mês (recorrente)
   - **Equipe:** R$ 149,90/mês (recorrente)
3. Copie os **Price IDs** (começam com `price_`)
4. Cole no código em `/server/stripe/products.ts`

### Passo 5: Testar Pagamentos

1. Use o cartão de teste do Stripe:
   - Número: `4242 4242 4242 4242`
   - Validade: Qualquer data futura
   - CVC: Qualquer 3 dígitos
2. Faça uma compra de teste
3. Verifique se aparece no Dashboard do Stripe

---

## 📁 ESTRUTURA DE PASTAS

Aqui está como o código está organizado:

```
neuroplan/
├── client/                    # Front-end (React)
│   ├── src/
│   │   ├── pages/            # Páginas do site
│   │   │   ├── Home.tsx      # Landing page
│   │   │   ├── Dashboard.tsx # Dashboard principal
│   │   │   ├── Pricing.tsx   # Página de preços
│   │   │   ├── Onboarding.tsx # Onboarding de 5 passos
│   │   │   └── ...
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── FocusGarden.tsx # Jardim do Foco
│   │   │   ├── Testimonials.tsx # Depoimentos
│   │   │   └── ...
│   │   ├── lib/              # Bibliotecas auxiliares
│   │   │   ├── trpc.ts       # Cliente tRPC
│   │   │   └── ...
│   │   └── index.css         # Estilos globais
│   └── index.html            # HTML principal
├── server/                    # Back-end (Node.js)
│   ├── _core/                # Núcleo do Manus Forge
│   │   ├── index.ts          # Servidor Express
│   │   ├── trpc.ts           # Configuração tRPC
│   │   └── ...
│   ├── projects.ts           # Lógica de projetos
│   ├── cycles.ts             # Lógica de ciclos
│   ├── ai.ts                 # Integração com OpenAI
│   ├── stripe/               # Integração com Stripe
│   │   ├── stripe.ts         # Cliente Stripe
│   │   ├── webhook.ts        # Webhook de pagamentos
│   │   └── products.ts       # Produtos e preços
│   └── routers.ts            # Rotas da API
├── drizzle/                   # Banco de dados
│   ├── schema.ts             # Estrutura das tabelas
│   └── migrations/           # Histórico de mudanças
├── content/                   # Conteúdo estático
│   └── blog/                 # Artigos do blog
│       └── o-que-e-a-taxa-do-tdah.md
├── package.json              # Dependências do projeto
├── vite.config.ts            # Configuração do Vite (bundler)
└── README.md                 # Documentação
```

---

## ❓ PERGUNTAS FREQUENTES

### 1. Como funciona a IA que quebra tarefas?

A IA usa o modelo **GPT-4 da OpenAI**. Quando você descreve um projeto, o sistema envia uma solicitação para a API da OpenAI com um prompt específico:

```
"Você é um assistente para pessoas com TDAH. Quebre este projeto em tarefas pequenas e acionáveis, usando o sistema A-B-C (mínima, ideal, bônus)."
```

A IA retorna as tarefas e o sistema salva no banco de dados.

---

### 2. Meus dados estão seguros?

**Sim.** O NeuroExecução segue as melhores práticas de segurança:
- **Criptografia:** Todos os dados são criptografados em trânsito (HTTPS) e em repouso
- **LGPD:** Conformidade com a Lei Geral de Proteção de Dados
- **Stripe:** Processa pagamentos de forma segura (PCI-DSS compliant)
- **Manus Auth:** Autenticação gerenciada pelo Manus Forge (OAuth 2.0)

---

### 3. Posso usar no celular?

**Sim!** O NeuroExecução é **responsivo**, ou seja, funciona perfeitamente em celular, tablet e desktop.

---

### 4. Como funciona o trial de 7 dias?

Quando você clica em "Teste o Pro por 7 Dias Grátis", o Stripe cria uma assinatura com trial. Você não é cobrado nos primeiros 7 dias. Após 7 dias, o cartão é cobrado automaticamente.

**Cancelamento:** Você pode cancelar a qualquer momento antes dos 7 dias e não será cobrado.

---

### 5. Posso adicionar mais funcionalidades?

**Sim!** O código é modular e fácil de estender. Você pode contratar um desenvolvedor para adicionar novas funcionalidades.

---

### 6. Como faço backup dos dados?

O Manus Forge faz backup automático do banco de dados. Você também pode exportar seus dados:
1. Vá em "Settings" → "Database"
2. Clique em "Export Data"
3. Baixe o arquivo SQL

---

### 7. Quanto custa hospedar o NeuroExecução?

**Manus Forge:** Plano gratuito até 10.000 visitantes/mês. Depois, a partir de $19/mês.

**Custos adicionais:**
- **Stripe:** 3,99% + R$ 0,39 por transação
- **OpenAI:** ~$0,01 por tarefa quebrada pela IA

---

### 8. Como atualizo o código?

1. Faça as mudanças no código
2. Commit no GitHub:
   ```bash
   git add .
   git commit -m "Descrição da mudança"
   git push origin main
   ```
3. O Manus Forge detecta automaticamente e faz o deploy

---

### 9. Como vejo os logs de erro?

1. Acesse o Manus Forge
2. Vá em "Dashboard" → "Logs"
3. Veja os erros em tempo real

---

### 10. Posso mudar o domínio?

**Sim!** Você pode adicionar um domínio personalizado:
1. Compre um domínio (ex: neuroexecucao.com.br)
2. No Manus Forge, vá em "Settings" → "Domains"
3. Adicione o domínio
4. Configure o DNS conforme as instruções

---

## 📚 RECURSOS ADICIONAIS

### Documentação Oficial

- **React:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Stripe:** https://stripe.com/docs
- **OpenAI:** https://platform.openai.com/docs
- **Manus Forge:** https://docs.manus.im

### Comunidades

- **Reddit TDAH:** r/ADHD
- **Discord React:** https://discord.gg/react
- **Stack Overflow:** https://stackoverflow.com

---

## 🎓 CONCLUSÃO

O **NeuroExecução** é um sistema completo e robusto, desenhado especificamente para ajudar pessoas com TDAH a concluir projetos. Ele combina:
- **Ciência:** Princípios de Russell Barkley
- **Tecnologia:** React, Node.js, MySQL, OpenAI
- **Design:** Interface neuro-inclusiva e responsiva
- **Negócio:** Modelo de assinatura via Stripe

Agora você tem uma visão completa de como tudo funciona, desde o front-end até o banco de dados, passando por todas as integrações de API.

**Próximos passos:**
1. Configurar as chaves do Stripe
2. Testar o sistema completo
3. Começar a escalar com tráfego pago

---

**Preparado por:** Manus AI  
**Data:** 13 de Janeiro de 2026  
**Versão:** 2.0 - Guia Completo para Não-Programadores
