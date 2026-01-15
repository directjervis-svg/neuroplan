# 🚀 Guia de Deploy Staging - NeuroExecução

**Data:** 15 de Janeiro de 2026  
**Versão:** 1.0  
**Ambiente:** Staging (Manus Hosting)

---

## 📋 Objetivo

Realizar deploy do NeuroExecução em ambiente staging para:
1. Validar implementações em ambiente real
2. Executar testes E2E com usuários internos
3. Identificar bugs antes do deploy produção

---

## ⚠️ Pré-requisitos

### 1. Código Pronto
- ✅ Todos os bloqueadores implementados
- ✅ 170 testes passando
- ✅ Build sem erros
- ✅ Commits pushed para GitHub

### 2. Acesso à Infraestrutura
- [ ] Acesso ao Manus Hosting (painel de controle)
- [ ] Chaves SSH configuradas
- [ ] Permissões de deploy

### 3. Variáveis de Ambiente Staging
- [ ] `DATABASE_URL` (TiDB Cloud ou MySQL staging)
- [ ] `OPENAI_API_KEY` (chave real)
- [ ] `STRIPE_SECRET_KEY` (modo teste)
- [ ] `JWT_SECRET` (staging secret)
- [ ] `OAUTH_SERVER_URL` (Manus API)

---

## 🔧 Opções de Deploy

### Opção 1: Deploy via Manus Hosting (Recomendado)

**Passo 1: Conectar Repositório**
```bash
# No painel Manus Hosting:
1. Ir em "New Project"
2. Conectar GitHub: directjervis-svg/neuroplan
3. Branch: main
4. Framework: Node.js (Express + Vite)
```

**Passo 2: Configurar Build**
```bash
# Build Command:
npm run build

# Start Command:
npm start

# Install Command:
npm install
```

**Passo 3: Variáveis de Ambiente**
```env
DATABASE_URL=mysql://user:pass@host:port/neuroplan_staging
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXX
JWT_SECRET=staging-jwt-secret-XXXXXXX
OAUTH_SERVER_URL=https://api.manus.im
NODE_ENV=production
```

**Passo 4: Deploy**
```bash
# Deploy automático ao push para main
git push origin main

# Ou deploy manual no painel
```

---

### Opção 2: Deploy Manual via SSH

**Passo 1: Conectar ao Servidor**
```bash
ssh user@staging.neuroexecucao.com.br
```

**Passo 2: Clonar Repositório**
```bash
cd /var/www
git clone https://github.com/directjervis-svg/neuroplan.git
cd neuroplan
```

**Passo 3: Instalar Dependências**
```bash
npm install --production
```

**Passo 4: Configurar .env**
```bash
nano .env
# Colar variáveis de staging
```

**Passo 5: Executar Migrações**
```bash
# Conectar ao banco staging
mysql -h <host> -u <user> -p neuroplan_staging

# Executar migrações
source drizzle/migrations/20260115183200_add_age_verification.sql
```

**Passo 6: Build**
```bash
npm run build
```

**Passo 7: Iniciar Servidor**
```bash
# Com PM2 (recomendado)
pm2 start dist/index.js --name neuroplan-staging

# Ou com systemd
sudo systemctl start neuroplan-staging
```

---

### Opção 3: Deploy via Docker (Alternativo)

**Passo 1: Criar Dockerfile**
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

**Passo 2: Build Imagem**
```bash
docker build -t neuroplan-staging .
```

**Passo 3: Rodar Container**
```bash
docker run -d \
  --name neuroplan-staging \
  -p 5000:5000 \
  --env-file .env.staging \
  neuroplan-staging
```

---

## 🗄️ Configuração do Banco de Dados Staging

### Opção A: TiDB Cloud (Recomendado)

**Vantagens:**
- Compatível com MySQL
- Escalável automaticamente
- Backup automático
- Free tier disponível

**Passos:**
1. Criar cluster staging em https://tidbcloud.com
2. Copiar connection string
3. Adicionar em `DATABASE_URL`

**Exemplo:**
```env
DATABASE_URL=mysql://user:pass@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/neuroplan_staging?ssl={"rejectUnauthorized":true}
```

### Opção B: MySQL Standalone

**Passos:**
1. Criar banco `neuroplan_staging`
2. Executar migrações:
```sql
-- Migração de idade
ALTER TABLE users ADD COLUMN birth_date DATE NULL;
ALTER TABLE users ADD COLUMN age_verified BOOLEAN DEFAULT FALSE NOT NULL;

-- Outras migrações existentes
-- (executar arquivos em drizzle/migrations/)
```

---

## ✅ Checklist de Deploy

### Antes do Deploy
- [ ] Código em `main` branch atualizado
- [ ] Todos os testes passando localmente
- [ ] Build compilado sem erros
- [ ] Variáveis de ambiente staging preparadas
- [ ] Banco de dados staging criado
- [ ] Migrações SQL prontas

### Durante o Deploy
- [ ] Repositório conectado/clonado
- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] Migrações executadas no banco
- [ ] Build de produção gerado
- [ ] Servidor iniciado

### Após o Deploy
- [ ] URL staging acessível (ex: https://staging.neuroexecucao.com.br)
- [ ] Health check passa (`/api/system/health`)
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Logs sem erros críticos

---

## 🧪 Validação Pós-Deploy

### 1. Health Check
```bash
curl https://staging.neuroexecucao.com.br/api/system/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-15T21:00:00.000Z",
  "uptime": 123.45
}
```

### 2. Teste de Login
1. Acessar `https://staging.neuroexecucao.com.br`
2. Clicar em "Entrar com Manus"
3. Fazer login com conta de teste
4. Verificar se dashboard carrega

### 3. Teste de Validação de Idade
1. Criar usuário novo
2. Verificar se modal de idade aparece
3. Inserir data válida (>= 18 anos)
4. Confirmar que acesso é liberado

### 4. Teste de Templates
1. Clicar em "Novo Projeto"
2. Verificar se 5 templates aparecem
3. Selecionar template "Lançar Produto Digital"
4. Confirmar que projeto é criado com tarefas

### 5. Teste de Loading States
1. Criar projeto do zero
2. Observar loading no Step 3, 4, 5
3. Confirmar animações e dicas

---

## 📊 Monitoramento

### Logs
```bash
# Ver logs em tempo real
pm2 logs neuroplan-staging

# Ou via systemd
journalctl -u neuroplan-staging -f
```

### Métricas
```bash
# Status do servidor
pm2 status

# Uso de recursos
pm2 monit
```

### Erros
```bash
# Ver últimos erros
pm2 logs neuroplan-staging --err --lines 50
```

---

## 🐛 Troubleshooting

### Problema: "Cannot connect to database"
**Causa:** DATABASE_URL incorreto ou banco inacessível  
**Solução:**
```bash
# Testar conexão manualmente
mysql -h <host> -u <user> -p <database>

# Verificar firewall/whitelist
```

### Problema: "OpenAI API key invalid"
**Causa:** Chave não configurada ou inválida  
**Solução:**
```bash
# Verificar variável
echo $OPENAI_API_KEY

# Testar chave
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Problema: "Port 5000 already in use"
**Causa:** Processo anterior não foi encerrado  
**Solução:**
```bash
# Matar processo
pm2 stop neuroplan-staging
pm2 delete neuroplan-staging

# Ou via kill
lsof -ti:5000 | xargs kill -9
```

### Problema: "Build failed"
**Causa:** Dependências faltando ou erro de compilação  
**Solução:**
```bash
# Limpar cache
rm -rf node_modules dist
npm install
npm run build
```

---

## 🔄 Rollback

Se algo der errado:

**Opção 1: Reverter Commit**
```bash
git revert HEAD
git push origin main
# Deploy automático com código anterior
```

**Opção 2: Restaurar Backup**
```bash
# Parar servidor
pm2 stop neuroplan-staging

# Restaurar código anterior
git checkout <commit-anterior>
npm install
npm run build
pm2 restart neuroplan-staging
```

**Opção 3: Restaurar Banco**
```bash
# Restaurar snapshot do banco staging
# (via painel TiDB Cloud ou backup manual)
```

---

## 📝 Próximos Passos

Após deploy staging bem-sucedido:
1. ✅ Executar testes E2E (docs/PLANO_TESTES_MANUAIS_BLOQUEADORES.md)
2. ✅ Validar com 3-5 usuários internos
3. ✅ Documentar bugs encontrados
4. ✅ Corrigir bugs críticos
5. ✅ Preparar deploy produção

---

## 📞 Contatos de Emergência

**Infraestrutura:** Suporte Manus (support@manus.im)  
**Banco de Dados:** TiDB Cloud Support  
**Deploy:** Leonardo (Founder)

---

**Documento criado em:** 15/01/2026 18:55 GMT-3
