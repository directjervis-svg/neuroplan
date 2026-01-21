# 🚀 Guia de Setup - Deploy Automático via GitHub

**Objetivo:** Configurar deploy automático do NeuroExecução sempre que você fizer push no GitHub  
**Tempo estimado:** 15 minutos  
**Nível:** Iniciante (sem conhecimento técnico necessário)

---

## 📋 Pré-requisitos

- ✅ Conta no GitHub (você já tem)
- ✅ Repositório `directjervis-svg/neuroplan` (você já tem)
- ✅ Conta no Manus (você já tem)
- ✅ Projeto publicado no Manus (`neuroplan-4wuusrck.manus.space`)

---

## 🔧 Passo 1: Conectar GitHub ao Manus

### No Painel do Manus:

1. Acesse: **https://manus.im/dashboard**
2. Clique em **"Configurações"** (Settings)
3. Vá para aba **"GitHub"**
4. Clique em **"Conectar Repositório"**
5. Selecione: `directjervis-svg/neuroplan`
6. Clique em **"Autorizar"**

**Resultado esperado:** Você verá "✅ Repositório conectado"

---

## 🔐 Passo 2: Configurar Secrets (Variáveis Secretas)

Estas são as "chaves" que o seu app precisa para funcionar.

### No Painel do Manus:

1. Vá para **Settings → Secrets**
2. Clique em **"+ Adicionar Segredo"**
3. Adicione cada uma das variáveis abaixo:

#### Variáveis Obrigatórias:

```
OPENAI_API_KEY = sk-proj-... (sua chave OpenAI)
DATABASE_URL = mysql://user:pass@host/neuroplan
JWT_SECRET = (gere uma chave aleatória)
```

#### Variáveis de Stripe (Pagamentos):

```
STRIPE_SECRET_KEY = sk_live_... (sua chave Stripe)
STRIPE_WEBHOOK_SECRET = whsec_... (seu webhook secret)
VITE_STRIPE_PUBLISHABLE_KEY = pk_live_... (sua chave pública)
```

#### Variáveis de Upstash (Cache/Rate Limiting):

```
UPSTASH_REDIS_REST_URL = https://...upstash.io
UPSTASH_REDIS_REST_TOKEN = ...
```

#### Variáveis de Aplicação:

```
VITE_APP_ID = neuroplan
VITE_APP_TITLE = NeuroExecução
NODE_ENV = production
```

**Dica:** Você já tem esses valores! Vá em **Settings → Segredos** no painel atual e copie cada um.

---

## 🔄 Passo 3: Habilitar Deploy Automático

### No Painel do Manus:

1. Vá para **Settings → Deploy**
2. Marque a opção: **"Deploy automático no push"**
3. Selecione branch: **"main"**
4. Clique em **"Salvar"**

**Resultado esperado:** Você verá "✅ Deploy automático ativado"

---

## ✅ Passo 4: Testar o Deploy

Agora vamos fazer um teste para garantir que tudo está funcionando.

### No seu computador (ou aqui no terminal):

```bash
cd neuroplan
git add -A
git commit -m "test: deploy automático"
git push origin main
```

### Volte ao Painel do Manus:

1. Vá para **Deployments** (ou **Activity**)
2. Você deve ver um novo deploy iniciando
3. Aguarde até aparecer "✅ Deploy concluído"

**Se tudo correr bem:**
- Você verá a mensagem: "✅ Aplicação atualizada com sucesso"
- O site em `https://neuroplan-4wuusrck.manus.space` será atualizado automaticamente
- Não precisa fazer mais nada!

---

## 🎯 Como Usar Daqui em Diante

### Fluxo Normal:

```bash
# 1. Fazer alterações no código
# 2. Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# 3. Pronto! O deploy acontece automaticamente
# Você pode acompanhar em: https://manus.im/dashboard → Deployments
```

### Acompanhar Deploy:

1. **Painel do Manus:** Settings → Activity
2. **GitHub:** Seu repositório → Actions
3. **Email:** Você receberá notificação quando terminar

---

## 🐛 Troubleshooting

### ❌ Deploy falhou com erro "Secrets não encontrados"

**Solução:**
1. Verifique se todos os secrets foram adicionados
2. Certifique-se de que os nomes estão corretos (maiúsculas/minúsculas)
3. Tente fazer push novamente

### ❌ Site não atualiza após push

**Solução:**
1. Aguarde 2-3 minutos (o deploy leva tempo)
2. Faça refresh na página (Ctrl+F5 ou Cmd+Shift+R)
3. Verifique o status em Deployments

### ❌ Erro "Database connection failed"

**Solução:**
1. Verifique se `DATABASE_URL` está correto
2. Teste a conexão: `mysql -u user -p -h host neuroplan`
3. Certifique-se de que o banco está online

### ❌ Erro "OpenAI API key invalid"

**Solução:**
1. Verifique se `OPENAI_API_KEY` está correto
2. Gere uma nova chave em https://platform.openai.com/api-keys
3. Atualize o secret no Manus

---

## 📊 Monitorando o Deploy

### Métricas Importantes:

| Métrica | Onde Verificar | O que significa |
|---------|---|---|
| **Status** | Deployments | ✅ Online ou ❌ Erro |
| **Tempo de Deploy** | Activity | Quanto tempo levou |
| **Créditos Usados** | Billing | Quanto custou |
| **Uptime** | Health | % de disponibilidade |

### Alertas Automáticos:

Você receberá notificação se:
- ❌ Deploy falhar
- ⚠️ Aplicação ficar offline
- 💰 Créditos acabarem
- 🔴 Erro na aplicação

---

## 🚀 Próximos Passos

### Agora que o deploy está automático:

1. **Faça alterações com confiança** - Cada push será automaticamente publicado
2. **Monitore o uso de créditos** - Vá em Billing para ver o consumo
3. **Configure alertas** - Settings → Notifications
4. **Escale gradualmente** - Comece com Manus Lite, migre para Manus conforme cresce

---

## 📞 Suporte

Se tiver dúvidas:

1. **Documentação Manus:** https://docs.manus.im
2. **Suporte:** https://help.manus.im
3. **Comunidade:** https://community.manus.im

---

## ✨ Benefícios do Deploy Automático

✅ **Sem trabalho manual** - Não precisa fazer deploy manualmente  
✅ **Sem downtime** - O site continua online durante o deploy  
✅ **Rollback automático** - Se algo quebrar, volta para versão anterior  
✅ **Histórico completo** - Veja todos os deploys anteriores  
✅ **Notificações** - Saiba quando termina  

---

**Parabéns! 🎉 Seu deploy automático está configurado!**

Agora você pode focar em desenvolver novas funcionalidades sem se preocupar com deploy.

---

*Versão: 1.0*  
*Data: Janeiro 2026*  
*Status: ✅ Pronto para Produção*
