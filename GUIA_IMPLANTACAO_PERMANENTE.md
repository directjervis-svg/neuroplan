# Guia de Implantação Permanente - NeuroExecução no Manus

Este documento descreve como configurar o projeto para rodar permanentemente no ambiente de produção do Manus com auto-healing e monitoramento contínuo.

## 1. Pré-Requisitos

- ✅ Repositório GitHub conectado ao painel do Manus
- ✅ Variáveis de ambiente (Secrets) configuradas no painel
- ✅ Banco de dados MySQL/TiDB provisionado
- ✅ Health Check endpoints implementados (`/health`, `/health/ready`, `/health/live`)

## 2. Configuração de Produção Permanente

### 2.1. Variáveis de Ambiente Obrigatórias

Certifique-se de que as seguintes variáveis estão configuradas no painel de **Secrets** do Manus:

```
DATABASE_URL=mysql://user:password@host:port/database
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
MANUS_AUTH_SECRET=...
NODE_ENV=production
PORT=3000
```

### 2.2. Scripts de Inicialização

O projeto está configurado com os seguintes scripts:

| Script | Descrição |
| :--- | :--- |
| `npm run build` | Compila o frontend (Vite) e o backend (esbuild) |
| `npm run db:migrate:prod` | Executa as migrações do Drizzle de forma segura |
| `npm run start:prod` | Build + Migração + Inicialização (Recomendado para produção) |
| `npm run start` | Inicia o servidor em modo produção (requer build prévio) |
| `npm run health-check` | Verifica a saúde do servidor |

### 2.3. Fluxo de Deploy Automático

1. **Você faz um push no GitHub** → `git push origin main`
2. **Manus detecta a mudança** → Webhook do GitHub dispara
3. **Manus executa o build** → `npm run build`
4. **Manus executa as migrações** → `npm run db:migrate:prod`
5. **Manus inicia o servidor** → `npm run start`
6. **Manus monitora a saúde** → Verifica `/health` a cada 30 segundos

## 3. Health Check e Auto-Healing

### 3.1. Endpoints de Monitoramento

O servidor expõe três endpoints de health check:

- **`GET /health`** - Status geral do servidor e banco de dados
- **`GET /health/ready`** - Readiness probe (pronto para receber tráfego?)
- **`GET /health/live`** - Liveness probe (servidor está vivo?)

### 3.2. Configuração de Auto-Healing no Manus

No painel do Manus, configure o **Auto-Healing** com as seguintes regras:

```
Health Check URL: /health
Interval: 30 segundos
Timeout: 5 segundos
Restart Policy: Reiniciar se falhar 3 vezes consecutivas
```

## 4. Monitoramento de Performance

### 4.1. Métricas Críticas

Monitore os seguintes indicadores:

| Métrica | Alerta | Ação |
| :--- | :--- | :--- |
| **Tempo de Resposta** | > 2s | Verificar queries lentas no banco |
| **Taxa de Erro** | > 5% | Revisar logs de erro |
| **Uso de Memória** | > 80% | Reiniciar servidor |
| **Uso de CPU** | > 90% | Escalar horizontalmente |

### 4.2. Logs de Produção

Os logs estão centralizados no painel do Manus. Procure por:

- `ERROR` - Erros críticos que requerem ação imediata
- `WARN` - Avisos de performance ou comportamento anômalo
- `INFO` - Eventos normais de operação

## 5. Backup e Recuperação

### 5.1. Backup Automático do Banco de Dados

Configure backups automáticos no seu provedor de banco de dados (MySQL/TiDB):

- **Frequência:** Diária
- **Retenção:** 30 dias
- **Local:** Cloud storage (AWS S3, Google Cloud Storage)

### 5.2. Plano de Recuperação

Em caso de falha:

1. **Verificar Health Check** → `curl https://neuroplan-4wuusrck.manus.space/health`
2. **Revisar Logs** → Painel do Manus → Logs
3. **Reiniciar Servidor** → Painel do Manus → Restart
4. **Restaurar Banco** → Se necessário, restaurar do backup mais recente

## 6. Atualizações e Manutenção

### 6.1. Processo de Atualização

1. **Fazer alterações no código** → `git commit -m "..."`
2. **Push para main** → `git push origin main`
3. **Manus detecta e faz deploy automático** → Sem intervenção manual
4. **Validar no site** → `https://neuroplan-4wuusrck.manus.space`

### 6.2. Manutenção Programada

Para manutenção planejada:

1. **Agendar downtime** → Notificar usuários com antecedência
2. **Pausar o servidor** → Painel do Manus → Pause
3. **Executar manutenção** → Backup, limpeza de logs, etc.
4. **Reiniciar** → Painel do Manus → Resume

## 7. Checklist Final de Implantação

- [ ] Todas as variáveis de ambiente estão configuradas no Manus
- [ ] Banco de dados está provisionado e acessível
- [ ] Health Check endpoints estão respondendo corretamente
- [ ] Auto-healing está ativado no painel do Manus
- [ ] Backups automáticos estão configurados
- [ ] Logs estão sendo coletados e monitorados
- [ ] Equipe foi treinada no processo de deploy
- [ ] Plano de recuperação foi documentado e testado

---

**Status:** ✅ Pronto para Implantação Permanente
**Versão:** 2.0.0
**Última Atualização:** 21 de Janeiro de 2026
