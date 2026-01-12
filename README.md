# NeuroExecução - Gestão de Projetos para TDAH

**Versão:** 1.1.0 (Pronto para Comercialização)
**Data:** 12 de Janeiro de 2026
**Acesso Online:** [https://3000-idphu5l4kt312b1w8oa01-9b119bb8.us2.manus.computer](https://3000-idphu5l4kt312b1w8oa01-9b119bb8.us2.manus.computer)

---

## 🧠 Sobre o Projeto

O NeuroExecução é um sistema de gestão de projetos neuroadaptado, desenhado especificamente para adultos com TDAH. Ele se baseia nos princípios do Dr. Russell Barkley, focando em ciclos curtos, feedback imediato e redução da sobrecarga cognitiva.

### Funcionalidades Principais

- **Ciclos de 3 Dias:** Planejamento de curto prazo para manter o foco.
- **Timer Progressivo:** Mede o tempo de foco em vez de criar pressão com contagem regressiva.
- **Dashboard Barkley:** Interface simplificada com 3 painéis (Tarefas | Workspace | Info).
- **Modo Offline:** Funcionalidade completa sem conexão com a internet.
- **Gamificação:** Sistema de recompensas e conquistas para manter a motivação.
- **Relatórios Semanais:** Análise de produtividade enviada por e-mail.
- **Integração com Stripe:** Assinaturas para planos PRO e TEAM.
- **Google Analytics:** Tracking de eventos para análise de uso.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js (v22+)
- pnpm (v10+)
- MySQL (v8+)

### 1. Instalação

Clone o repositório e instale as dependências:

```bash
gh repo clone directjervis-svg/neuroplan
cd neuroplan
pnpm install
```

### 2. Configuração do Banco de Dados

Inicie o MySQL e crie o banco de dados:

```bash
sudo service mysql start
mysql -u root -e "CREATE DATABASE IF NOT EXISTS neuroplan;"
```

### 3. Variáveis de Ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

**Variáveis necessárias:**

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL de conexão com o MySQL |
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Segredo do webhook do Stripe |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Chave publicável do Stripe |
| `VITE_GA_MEASUREMENT_ID` | ID de medição do Google Analytics 4 |
| `OPENAI_API_KEY` | Chave da API da OpenAI (para assistente IA) |

### 4. Migrações do Banco de Dados

Execute as migrações para criar as tabelas:

```bash
pnpm db:push
```

### 5. Executando em Desenvolvimento

```bash
pnpm dev
```

O site estará disponível em `http://localhost:3000`.

### 6. Build de Produção

```bash
pnpm build
NODE_ENV=production node dist/index.js
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS 4
- **Backend:** Node.js, tRPC, Drizzle ORM
- **Banco de Dados:** MySQL
- **Offline:** Dexie.js (IndexedDB), Service Worker
- **Pagamentos:** Stripe
- **Analytics:** Google Analytics 4

---

## 📝 Documentação Adicional

- **Relatório de Implementação:** `RELATORIO_IMPLEMENTACAO_ISSUES_1_5.md`
- **Manual do Produto:** `ENTREGA_PARTE_1_MANUAL_PRODUTO.md`
- **Documentação de Infraestrutura:** `ENTREGA_PARTE_2_INFRAESTRUTURA.md`
- **Auditoria e Pendências:** `ENTREGA_PARTE_3_AUDITORIA.md`
