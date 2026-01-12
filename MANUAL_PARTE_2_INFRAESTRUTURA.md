# NeuroExecução - Manual Oficial de Entrega
## PARTE 2: Infraestrutura e Configuração

**Data de Entrega:** 11 de Janeiro de 2026  
**Versão do Projeto:** 1.0.0  
**Desenvolvido por:** Manus AI

---

## 1. Variáveis de Ambiente (.env)

O sistema NeuroExecução depende de várias variáveis de ambiente para funcionar corretamente. Estas variáveis controlam conexões com serviços externos, chaves de API e configurações de segurança.

### 1.1 Variáveis Obrigatórias (Sistema Manus)

Estas variáveis são **automaticamente gerenciadas pelo Manus** e já estão configuradas:

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `VITE_APP_ID` | ID único da aplicação no Manus | Configurado automaticamente |
| `VITE_APP_TITLE` | Título da aplicação exibido na aba | "NeuroExecução" |
| `VITE_APP_LOGO` | URL do logo | Configurado automaticamente |
| `VITE_OAUTH_PORTAL_URL` | URL do portal OAuth Manus | https://api.manus.im |
| `VITE_FRONTEND_FORGE_API_URL` | URL da API frontend | Configurado automaticamente |
| `VITE_FRONTEND_FORGE_API_KEY` | Chave da API frontend | Configurado automaticamente |
| `BUILT_IN_FORGE_API_URL` | URL da API backend | Configurado automaticamente |
| `BUILT_IN_FORGE_API_KEY` | Chave da API backend | Configurado automaticamente |
| `JWT_SECRET` | Chave secreta para tokens JWT | Gerada automaticamente |
| `OAUTH_SERVER_URL` | URL do servidor OAuth | https://api.manus.im |
| `OWNER_NAME` | Nome do proprietário | Seu nome |
| `OWNER_OPEN_ID` | ID OpenID do proprietário | Seu ID |

**Ação Necessária:** Nenhuma. Estas variáveis estão todas configuradas automaticamente pelo Manus.

### 1.2 Variáveis de Pagamento (Stripe)

O sistema utiliza Stripe para processar pagamentos de assinaturas. Estas variáveis precisam ser configuradas:

| Variável | Descrição | Onde Obter | Exemplo |
|----------|-----------|-----------|---------|
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe (backend) | Dashboard Stripe → API Keys | `sk_test_51234567890abcdef...` |
| `STRIPE_WEBHOOK_SECRET` | Chave para validar webhooks | Dashboard Stripe → Webhooks | `whsec_1234567890abcdef...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Chave pública do Stripe (frontend) | Dashboard Stripe → API Keys | `pk_test_51234567890abcdef...` |

**Como Obter as Chaves Stripe:**

1. Acesse https://dashboard.stripe.com/
2. Faça login com sua conta Stripe
3. No menu esquerdo, clique em "Developers" → "API Keys"
4. Você verá duas chaves: **Publishable Key** (pública) e **Secret Key** (secreta)
5. Copie a **Secret Key** e configure em `STRIPE_SECRET_KEY`
6. Copie a **Publishable Key** e configure em `VITE_STRIPE_PUBLISHABLE_KEY`
7. Para o webhook, vá em "Webhooks" e crie um novo endpoint apontando para `https://seu-dominio.com/api/stripe/webhook`
8. Copie o **Signing Secret** e configure em `STRIPE_WEBHOOK_SECRET`

**Status Atual:** Um sandbox Stripe foi criado automaticamente, mas ainda não foi "reclamado" (claimed). Você precisa acessar https://dashboard.stripe.com/claim_sandbox/... antes de 10 de Março de 2026 para ativar o ambiente de teste.

### 1.3 Variáveis de Analytics (Opcional)

Se você quiser rastrear eventos de usuários:

| Variável | Descrição | Onde Obter |
|----------|-----------|-----------|
| `VITE_ANALYTICS_WEBSITE_ID` | ID do website no serviço de analytics | Seu serviço de analytics |
| `VITE_ANALYTICS_ENDPOINT` | URL do endpoint de analytics | Seu serviço de analytics |

**Ação Necessária:** Opcional. Se não configurado, o sistema funciona normalmente sem rastreamento.

### 1.4 Banco de Dados

O sistema usa **MySQL** como banco de dados. A conexão é gerenciada automaticamente pelo Manus, mas você precisa saber:

- **Host:** Gerenciado pelo Manus
- **Porta:** 3306 (padrão MySQL)
- **Usuário:** Gerenciado pelo Manus
- **Senha:** Gerenciada pelo Manus
- **Banco:** `neuroplan`

**Ação Necessária:** Nenhuma. O banco está pré-configurado.

---

## 2. Serviços Externos Necessários

O NeuroExecução depende de vários serviços externos para funcionar completamente. Abaixo está uma lista de cada um com o que faz e como configurar:

### 2.1 Stripe (Pagamentos)

**O que faz:** Processa pagamentos de assinaturas (PRO, TEAM)  
**Status:** Configurado, mas sandbox precisa ser ativado  
**Como Configurar:**

1. Acesse https://dashboard.stripe.com/claim_sandbox/YWNjdF8xU25NbmVJQnZpZ2xabWZvLDE3Njg1NjU1NzAv100cwFNXAIQ
2. Siga as instruções para reclamar o sandbox
3. Configure as chaves de API conforme descrito na seção anterior
4. Teste criando uma assinatura de teste

### 2.2 OAuth Manus (Autenticação)

**O que faz:** Autentica usuários e gerencia sessões  
**Status:** Totalmente configurado  
**Como Funciona:** Quando um usuário clica em "Entrar", é redirecionado para o portal OAuth Manus, que valida as credenciais e retorna um token de sessão

### 2.3 IA (Processamento de Briefings)

**O que faz:** Processa descrições de projetos e gera tarefas estruturadas  
**Status:** Integrado e funcional  
**Como Funciona:** Quando um usuário descreve um projeto, o sistema envia para um modelo de IA que retorna tarefas decompostas em ciclos de 3 dias

**Nota:** A integração de IA está completa no código. Se você quiser usar um provedor diferente (OpenAI, Anthropic, etc.), será necessário modificar o arquivo `server/ai.ts`.

### 2.4 AWS S3 (Armazenamento de Arquivos)

**O que faz:** Armazena proofs (evidências) de tarefas completadas e outros arquivos  
**Status:** Integrado e funcional  
**Como Funciona:** Quando um usuário faz upload de uma evidência de conclusão de tarefa, é enviada para S3 e um URL presigned é gerado

**Configuração:** As credenciais AWS estão gerenciadas pelo Manus automaticamente.

### 2.5 Google Calendar (Opcional)

**O que faz:** Permite sincronizar ciclos de tarefas com Google Calendar  
**Status:** Integrado  
**Como Configurar:** O usuário autoriza o acesso ao seu Google Calendar na primeira vez que usa a funcionalidade

---

## 3. Instalação e Deploy

### 3.1 Instalação Local (Para Desenvolvimento)

Se você quiser rodar o projeto em seu próprio computador:

**Pré-requisitos:**
- Node.js 22.13.0 ou superior
- pnpm 10.4.1 ou superior
- Git
- MySQL 8.0 ou superior

**Passos:**

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/neuroplan.git
cd neuroplan

# 2. Instale as dependências
pnpm install

# 3. Configure as variáveis de ambiente
# Crie um arquivo .env na raiz do projeto com as variáveis listadas na Seção 1

# 4. Configure o banco de dados
# Crie um banco MySQL chamado "neuroplan"
mysql -u seu-usuario -p -e "CREATE DATABASE neuroplan;"

# 5. Execute as migrações do banco
pnpm db:push

# 6. Inicie o servidor de desenvolvimento
pnpm dev

# 7. Abra http://localhost:3000 no navegador
```

### 3.2 Deploy no Manus (Recomendado)

O NeuroExecução já está configurado para rodar no Manus. Para fazer deploy:

1. Acesse o painel de controle do Manus
2. Clique em "Publish" no header superior
3. Selecione o checkpoint mais recente
4. Clique em "Publicar"
5. O site estará disponível em `https://seu-dominio.manus.space`

**Vantagens do Deploy no Manus:**
- Hospedagem automática
- SSL/HTTPS incluído
- Banco de dados gerenciado
- Backups automáticos
- Suporte a domínios customizados

### 3.3 Deploy em Outro Servidor (Avançado)

Se você quiser rodar em um servidor próprio (AWS, DigitalOcean, etc.):

**Pré-requisitos:**
- Servidor com Node.js 22+
- MySQL 8.0+
- Nginx ou Apache como reverse proxy

**Passos:**

```bash
# 1. Build da aplicação
pnpm build

# 2. Copie os arquivos para o servidor
scp -r dist/* seu-servidor:/var/www/neuroplan/

# 3. Configure as variáveis de ambiente no servidor
ssh seu-servidor
nano /var/www/neuroplan/.env
# Adicione todas as variáveis necessárias

# 4. Inicie a aplicação
cd /var/www/neuroplan
node dist/index.js

# 5. Configure Nginx como reverse proxy
# Crie um arquivo de configuração em /etc/nginx/sites-available/neuroplan
# Aponte para http://localhost:3000
```

**Arquivo de Configuração Nginx (exemplo):**

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.4 Verificação Pós-Deploy

Após fazer deploy, verifique se tudo está funcionando:

```bash
# 1. Verifique se o servidor está respondendo
curl https://seu-dominio.com/

# 2. Verifique se o login funciona
# Acesse https://seu-dominio.com/ e clique em "Entrar"

# 3. Verifique se o banco está conectado
# Crie um novo projeto e verifique se aparece na lista

# 4. Verifique se os pagamentos funcionam
# Acesse /pricing e tente fazer checkout (use cartão de teste do Stripe)
```

---

## 4. Estrutura de Pastas

Para entender onde cada coisa está localizada:

```
neuroplan/
├── client/                    # Frontend (React)
│   ├── src/
│   │   ├── pages/            # Páginas (Home, Dashboard, etc)
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── _core/            # Hooks e utilitários
│   │   └── contexts/         # Contextos React
│   └── index.html
├── server/                    # Backend (Express + tRPC)
│   ├── _core/                # Configuração core (OAuth, TRPC, etc)
│   ├── db.ts                 # Funções de banco de dados
│   ├── routers.ts            # Endpoints da API
│   ├── ai.ts                 # Integração com IA
│   ├── stripe/               # Integração Stripe
│   ├── gamification.ts       # Sistema de XP e badges
│   └── notifications.ts      # Sistema de notificações
├── drizzle/                   # Migrações do banco
│   └── schema.ts             # Definição das tabelas
├── package.json              # Dependências
├── tsconfig.json             # Configuração TypeScript
├── vite.config.ts            # Configuração Vite
└── README.md                 # Documentação
```

---

## 5. Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento |
| `pnpm build` | Compila para produção |
| `pnpm start` | Inicia servidor de produção |
| `pnpm test` | Executa testes (170 testes) |
| `pnpm db:push` | Aplica migrações do banco |
| `pnpm check` | Verifica erros TypeScript |
| `pnpm format` | Formata código com Prettier |

---

## 6. Troubleshooting

### Problema: "Erro de conexão com banco de dados"

**Solução:**
1. Verifique se MySQL está rodando
2. Verifique as credenciais no .env
3. Verifique se o banco `neuroplan` existe
4. Execute `pnpm db:push` para criar as tabelas

### Problema: "Stripe key inválida"

**Solução:**
1. Verifique se você copiou a chave correta (Secret Key, não Publishable Key)
2. Verifique se a chave não tem espaços em branco
3. Acesse https://dashboard.stripe.com/claim_sandbox/... para ativar o sandbox

### Problema: "Login não funciona"

**Solução:**
1. Verifique se `VITE_OAUTH_PORTAL_URL` está correto
2. Verifique se `VITE_APP_ID` está correto
3. Verifique se o redirect URI está cadastrado no Manus

### Problema: "IA não está respondendo"

**Solução:**
1. Verifique se a chave de API da IA está configurada
2. Verifique se há limite de requisições atingido
3. Tente novamente em alguns minutos

---

## 7. Checklist de Configuração

Antes de colocar em produção, verifique:

- [ ] Variáveis de ambiente configuradas (Stripe, OAuth)
- [ ] Banco de dados criado e migrações aplicadas
- [ ] Stripe sandbox reclamado e chaves configuradas
- [ ] Domínio customizado configurado (se desejado)
- [ ] SSL/HTTPS habilitado
- [ ] Testes executados com sucesso (`pnpm test`)
- [ ] Landing page testada em desktop e mobile
- [ ] Login testado e funcionando
- [ ] Criação de projeto testada
- [ ] Pagamentos testados com cartão de teste Stripe
- [ ] Notificações testadas (se habilitadas)
- [ ] Backups do banco configurados

---

## Suporte Técnico

Se encontrar problemas durante a configuração, entre em contato com o suporte Manus em https://help.manus.im
