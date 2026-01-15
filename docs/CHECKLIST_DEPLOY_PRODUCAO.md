# Checklist de Deploy Produção - Beta Privado

**Data:** 15 de Janeiro de 2026  
**Versão:** 1.0  
**Ambiente:** Produção (neuroexecucao.app)

---

## PRÉ-DEPLOY

### 1. Validações de Código
- [x] ✅ 170/170 testes passando
- [x] ✅ Build de produção completo sem erros
- [x] ✅ TypeScript sem erros (`npm run check`)
- [ ] ⏳ Code review de commits críticos
- [ ] ⏳ Documentação atualizada

### 2. Variáveis de Ambiente
Verificar se todas as variáveis estão configuradas em produção:

```bash
# Banco de Dados
DATABASE_URL="mysql://..."

# Autenticação
JWT_SECRET="[STRONG_SECRET]"
OAUTH_SERVER_URL="https://api.manus.im"

# Stripe (PRODUÇÃO - não teste!)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# OpenAI
OPENAI_API_KEY="sk-..."

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Google Analytics
VITE_GA_MEASUREMENT_ID="G-..."

# Aplicação
NODE_ENV="production"
VITE_APP_ID="neuroplan"
VITE_APP_TITLE="NeuroExecução"
```

### 3. Infraestrutura
- [ ] ⏳ Banco de dados MySQL criado
- [ ] ⏳ Upstash Redis configurado
- [ ] ⏳ Domínio neuroexecucao.app apontando para servidor
- [ ] ⏳ SSL/HTTPS configurado (Certbot)
- [ ] ⏳ Nginx configurado como reverse proxy
- [ ] ⏳ PM2 instalado para gerenciar processo Node.js

### 4. Stripe (Pagamentos)
- [ ] ⏳ Conta Stripe em modo PRODUÇÃO (não teste)
- [ ] ⏳ Produtos criados:
  - [ ] Plano Pro (R$ 29,90/mês)
  - [ ] Plano Team (R$ 99,90/mês) - opcional
- [ ] ⏳ Webhook configurado: `https://neuroexecucao.app/api/stripe/webhook`
- [ ] ⏳ Eventos do webhook:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

### 5. Google Analytics
- [ ] ⏳ Propriedade GA4 criada
- [ ] ⏳ ID de medição configurado
- [ ] ⏳ Eventos customizados configurados:
  - `project_created`
  - `task_completed`
  - `timer_started`
  - `upgrade_clicked`
  - `ab_test_dashboard_variant`

---

## DEPLOY

### 6. Executar Deploy
```bash
# 1. Conectar ao servidor via SSH
ssh ubuntu@neuroexecucao.app

# 2. Navegar para diretório do projeto
cd ~/neuroplan

# 3. Fazer backup do banco de dados
mysqldump -u neuro_user -p neuroplan > backup_$(date +%Y%m%d_%H%M%S).sql

# 4. Atualizar código
git pull origin main

# 5. Instalar dependências
pnpm install

# 6. Executar migrações
./scripts/run-migrations.sh

# 7. Build de produção
npm run build

# 8. Reiniciar aplicação
pm2 restart neuroplan-app

# 9. Verificar logs
pm2 logs neuroplan-app --lines 50
```

### 7. Validação Pós-Deploy
- [ ] ⏳ Site carrega em https://neuroexecucao.app
- [ ] ⏳ Login funciona
- [ ] ⏳ Criar projeto funciona
- [ ] ⏳ Timer funciona
- [ ] ⏳ Stripe checkout funciona (teste com cartão real)
- [ ] ⏳ Webhook Stripe recebe eventos
- [ ] ⏳ Google Analytics rastreando eventos

---

## PÓS-DEPLOY

### 8. Monitoramento
- [ ] ⏳ Configurar alertas de erro (Sentry ou similar)
- [ ] ⏳ Configurar monitoramento de uptime (UptimeRobot)
- [ ] ⏳ Configurar backup automático do banco (cron)
- [ ] ⏳ Verificar logs de erro: `pm2 logs neuroplan-app --err`

### 9. Comunicação
- [ ] ⏳ Enviar email para beta testers com link de acesso
- [ ] ⏳ Postar no LinkedIn anunciando Beta Privado
- [ ] ⏳ Postar no Instagram Stories
- [ ] ⏳ Atualizar status no GitHub README

### 10. Suporte
- [ ] ⏳ WhatsApp Business configurado para suporte
- [ ] ⏳ Email de suporte (contato@neuroexecucao.app) configurado
- [ ] ⏳ Tempo de resposta: < 2 horas (horário comercial)

---

## ROLLBACK (Se algo der errado)

### Plano de Emergência
```bash
# 1. Reverter para versão anterior
git revert HEAD
git push origin main

# 2. Rebuild e restart
npm run build
pm2 restart neuroplan-app

# 3. Restaurar backup do banco (se necessário)
mysql -u neuro_user -p neuroplan < backup_YYYYMMDD_HHMMSS.sql

# 4. Comunicar usuários
# Enviar email: "Estamos resolvendo um problema técnico. Voltamos em breve."
```

---

## MÉTRICAS DE SUCESSO (Primeiras 24h)

| Métrica | Meta | Resultado |
|---------|------|-----------|
| **Uptime** | > 99% | ___ |
| **Tempo de Resposta (P95)** | < 1s | ___ |
| **Taxa de Erro** | < 1% | ___ |
| **Conversões (Free → Pro)** | ≥ 1 | ___ |
| **Bugs Críticos Reportados** | 0 | ___ |

---

## CONTATOS DE EMERGÊNCIA

- **Hosting:** [suporte do provedor]
- **Stripe:** https://support.stripe.com
- **MySQL:** [suporte do provedor de banco]
- **Upstash:** https://upstash.com/support

---

## NOTAS FINAIS

- ⚠️ **NÃO FAZER DEPLOY EM SEXTA-FEIRA À NOITE**
- ⚠️ **TER SEMPRE UM BACKUP RECENTE DO BANCO**
- ⚠️ **TESTAR ROLLBACK ANTES DE PRECISAR DELE**
- ✅ **MONITORAR LOGS NAS PRIMEIRAS 2 HORAS**

**Responsável pelo Deploy:** [Seu Nome]  
**Data/Hora do Deploy:** _______________  
**Status:** [ ] Sucesso [ ] Rollback [ ] Problemas
