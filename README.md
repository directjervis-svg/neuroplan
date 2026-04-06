# NeuroExecução - Gestão de Projetos para TDAH

**Versão:** 1.1.0 (Pronto para Comercialização)
**Data:** 22 de Janeiro de 2026
**Status:** Auditoria e Rearme em Andamento

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
- Variáveis de Ambiente configuradas (ver seção 3)

### 1. Instalação e Configuração

Clone o repositório, instale as dependências e configure o ambiente:

```bash
# 1. Clonar e instalar dependências
gh repo clone directjervis-svg/neuroplan
cd neuroplan
pnpm install

# 2. Configurar o Banco de Dados (assumindo MySQL local)
# Inicie o MySQL e crie o banco de dados 'neuroplan'
sudo service mysql start
mysql -u root -e "CREATE DATABASE IF NOT EXISTS neuroplan;"

# 3. Configurar Variáveis de Ambiente
# Copie o arquivo de exemplo e preencha o .env
cp .env.example .env

# 4. Executar Migrações do Banco de Dados
pnpm db:push
```

### 2. Executando em Desenvolvimento

```bash
pnpm dev
```

O site estará disponível em `http://localhost:3000`.

### 3. Build de Produção

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

- **Relatório de Auditoria e Rearme:** `AUDITORIA_REARME_RELATORIO.md`
- **Diretrizes de Contribuição:** `CONTRIBUTING.md` (A ser criado)
- **Documentação de Infraestrutura:** Consulte a pasta `docs/` para guias detalhados.
- **Manual do Produto:** Consulte os arquivos `MANUAL_PARTE_*.md` para detalhes do produto.

---

## 🤝 Contribuição

Consulte o arquivo `CONTRIBUTING.md` para diretrizes sobre como submeter Pull Requests, reportar bugs e sugerir novas funcionalidades.


## Novo Componente: ExecutiveOffice_April2026.jsx

O componente `ExecutiveOffice_April2026.jsx` foi adicionado em `client/src/components/ExecutiveOffice_April2026.jsx`. Este componente parece ser uma interface de dashboard ou gerenciamento, provavelmente relacionada ao planejamento de sprints e gerenciamento de tarefas, incorporando cálculos dinâmicos de data, relógio em tempo real e rastreamento de status para tarefas e cursos.

Ele utiliza `lucide-react` para ícones e hooks padrão do React (`useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`).

**Nota:** Este componente está integrado à estrutura frontend existente de React/TypeScript/Vite. Integrações adicionais ao roteamento da aplicação ou a outros componentes podem ser necessárias, dependendo do seu caso de uso pretendido.
