# 🛠️ Guia de Preparação do Ambiente de Desenvolvimento

**Data:** 15 de Janeiro de 2026  
**Versão:** 1.0

---

## ✅ Status Atual do Ambiente

| Item | Status | Versão/Detalhes |
|------|--------|-----------------|
| **Node.js** | ✅ Instalado | v22.13.0 |
| **NPM** | ✅ Instalado | 10.9.2 |
| **Dependências** | ✅ Instaladas | node_modules/ presente |
| **Build** | ✅ Compilado | dist/ presente |
| **.env** | ✅ Configurado | Modo staging |
| **Banco de Dados** | ⚠️ SQLite local | dev.db |

---

## 🚀 Como Rodar Localmente

### Opção 1: Modo Desenvolvimento (Hot Reload)

```bash
cd /home/ubuntu/neuroplan
npm run dev
```

**O que acontece:**
- Frontend roda em `http://localhost:5173` (Vite)
- Backend roda em `http://localhost:5000` (Express)
- Hot reload ativado (mudanças aparecem automaticamente)

**Acesso:**
- Abrir navegador em `http://localhost:5173`

---

### Opção 2: Modo Produção (Build Completo)

```bash
cd /home/ubuntu/neuroplan
npm run build
npm start
```

**O que acontece:**
- Build completo é gerado em `dist/`
- Servidor único em `http://localhost:5000`
- Frontend servido como estático

**Acesso:**
- Abrir navegador em `http://localhost:5000`

---

## 🗄️ Banco de Dados

### SQLite Local (Desenvolvimento)

**Arquivo:** `dev.db`  
**Localização:** `/home/ubuntu/neuroplan/dev.db`

**Verificar se existe:**
```bash
ls -lh dev.db
```

**Se não existir, criar:**
```bash
npm run db:push
```

**Executar migrações:**
```bash
# Migração de validação de idade
sqlite3 dev.db < drizzle/migrations/20260115183200_add_age_verification.sql
```

---

## 🔑 Variáveis de Ambiente Críticas

### Já Configuradas (Staging)
- ✅ `DATABASE_URL` - SQLite local
- ✅ `JWT_SECRET` - Chave de teste
- ✅ `OAUTH_SERVER_URL` - Manus API
- ✅ `STRIPE_SECRET_KEY` - Modo teste (mock)

### Requerem Configuração Real
- ⚠️ `OPENAI_API_KEY` - Necessário para IA funcionar
- ⚠️ `UPSTASH_REDIS_REST_URL` - Opcional (rate limiting)
- ⚠️ `UPSTASH_REDIS_REST_TOKEN` - Opcional (rate limiting)

**Como configurar OpenAI:**
```bash
# Editar .env
nano .env

# Substituir linha 35:
OPENAI_API_KEY="sk-proj-XXXXXXXXXXXXXXXXXXXXXXXX"
```

---

## 🧪 Executar Testes

### Testes Backend (Vitest)
```bash
npm run test
```

**Resultado esperado:**
```
✓ 170 testes passando (100%)
Duration: ~1.4s
```

### Build de Produção
```bash
npm run build
```

**Resultado esperado:**
```
✓ built in 10-12s
dist/public/index.html (371 kB)
dist/public/assets/index.css (162 kB)
dist/public/assets/index.js (2.4 MB)
dist/index.js (262 kB)
```

---

## 🔍 Verificar Implementações

### 1. Validação de Idade

**Verificar schema:**
```bash
sqlite3 dev.db "PRAGMA table_info(users);" | grep -E "birth_date|age_verified"
```

**Resultado esperado:**
```
birth_date|DATE|0||0
age_verified|BOOLEAN|1|0|0
```

**Verificar componente:**
```bash
ls -lh client/src/components/AgeVerificationModal.tsx
```

### 2. Templates de Projeto

**Verificar arquivo:**
```bash
cat server/data/projectTemplates.ts | grep "id:"
```

**Resultado esperado:**
```
id: 'launch-digital-product',
id: 'write-article-report',
id: 'organize-event',
id: 'home-renovation',
id: 'plan-trip',
```

### 3. Loading States

**Verificar componentes:**
```bash
ls -lh client/src/components/wizard/AILoadingState.tsx
ls -lh client/src/components/wizard/AIErrorFallback.tsx
```

---

## 🐛 Troubleshooting

### Problema: "Cannot find module"
**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Port 5000 already in use"
**Solução:**
```bash
# Matar processo na porta 5000
lsof -ti:5000 | xargs kill -9

# Ou usar porta diferente
PORT=5001 npm run dev
```

### Problema: "Database locked"
**Solução:**
```bash
# Fechar todas as conexões SQLite
pkill -9 -f sqlite3

# Remover arquivo de lock
rm -f dev.db-shm dev.db-wal
```

### Problema: "OpenAI API key not found"
**Solução:**
```bash
# Verificar se variável está definida
echo $OPENAI_API_KEY

# Se vazio, adicionar no .env
echo 'OPENAI_API_KEY="sk-proj-XXXXXXX"' >> .env
```

---

## 📝 Checklist Pré-Testes

Antes de executar testes manuais:

- [ ] Node.js e NPM instalados
- [ ] Dependências instaladas (`npm install`)
- [ ] Build compilado sem erros (`npm run build`)
- [ ] Banco de dados criado (`dev.db` existe)
- [ ] Migrações executadas (campos `birth_date` e `age_verified` existem)
- [ ] Variável `OPENAI_API_KEY` configurada (se testar IA)
- [ ] Servidor rodando (`npm run dev` ou `npm start`)
- [ ] Navegador acessando `http://localhost:5173` ou `http://localhost:5000`

---

## 🚀 Próximo Passo

Após ambiente preparado:
1. Abrir `docs/PLANO_TESTES_MANUAIS_BLOQUEADORES.md`
2. Executar 12 cenários de teste
3. Documentar resultados e bugs
4. Prosseguir para deploy staging

---

**Documento criado em:** 15/01/2026 18:50 GMT-3
