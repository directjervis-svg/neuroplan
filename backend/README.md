# NeuroExecução AI Backend

Backend Python/FastAPI para o sistema de inteligência do NeuroExecução.

## Features

- **8 Personas C-Level** - Equipe virtual de especialistas
- **22+ Prompts Estruturados** - Biblioteca de prompts por categoria
- **Framework de Validação (CV)** - Coeficiente de validação de ideias
- **Features TDAH** - Timer progressivo, "Onde Parei", divisão por esforço
- **Chat Contextualizado** - Integração com Claude API

## Instalação

```bash
# Navegue até o diretório do backend
cd backend

# Instale dependências com UV (recomendado)
uv sync

# Ou com pip
pip install -e .
```

## Configuração

Crie um arquivo `.env` baseado em `.env.example`:

```bash
cp .env.example .env
```

Configure as variáveis:

```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
DEBUG=false
```

## Execução

```bash
# Desenvolvimento
uv run python main.py

# Ou com uvicorn diretamente
uv run uvicorn main:app --reload --port 8001
```

## Endpoints Principais

### Personas
- `GET /api/ai/personas` - Listar todas as personas
- `GET /api/ai/personas/{id}` - Detalhes de uma persona
- `GET /api/ai/personas/{id}/system-prompt` - Gerar system prompt

### Prompts
- `GET /api/ai/prompts` - Listar prompts (com filtros)
- `GET /api/ai/prompts/categories` - Listar categorias
- `GET /api/ai/prompts/{id}` - Detalhes de um prompt
- `POST /api/ai/prompts/{id}/render` - Renderizar prompt com variáveis

### Validação
- `GET /api/ai/validation/variables` - Framework de validação
- `POST /api/ai/validation/calculate` - Calcular CV
- `GET /api/ai/validation/example` - Exemplo completo

### Chat
- `POST /api/ai/chat` - Chat com persona/contexto
- `POST /api/ai/chat/with-prompt` - Executar prompt via chat

### TDAH Features
- `POST /api/ai/tdah/timer/start` - Iniciar timer progressivo
- `GET /api/ai/tdah/where-i-left-off` - Painel "Onde Parei"
- `GET /api/ai/tdah/tasks/effort-types` - Tipos de esforço (Brown)
- `GET /api/ai/tdah/citations` - Citações científicas

## Estrutura

```
backend/
├── main.py           # Entry point FastAPI
├── config.py         # Configurações
├── api/              # Rotas da API
│   ├── personas.py   # C-Level personas
│   ├── prompts.py    # Biblioteca de prompts
│   ├── validation.py # Framework CV
│   ├── chat.py       # Chat contextualizado
│   └── tdah.py       # Features TDAH
├── models/           # Modelos Pydantic
│   ├── persona.py    # 8 personas C-Level
│   ├── prompt.py     # 22+ prompts
│   ├── validation.py # Coeficiente CV
│   ├── chat.py       # Chat messages
│   └── tdah.py       # Timer, tasks, etc.
└── data/             # Dados estáticos
```

## Base Científica

O sistema é baseado em pesquisa de autoridades em TDAH:

- **Russell A. Barkley, PhD** - Miopia temporal, externalização
- **Thomas E. Brown, PhD** - 6 clusters de funções executivas
- **Joseph Biederman, MD** - Comorbidades e tratamento

Ver `docs/scientific/TDAH_FOUNDATIONS.md` para detalhes.

## Testes

```bash
uv run pytest
```

## Documentação API

Acesse `/docs` (Swagger) ou `/redoc` quando o servidor estiver rodando.
