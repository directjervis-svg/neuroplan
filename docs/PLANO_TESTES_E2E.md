# Plano de Testes End-to-End (E2E) - NeuroExecução

**Data:** 15 de Janeiro de 2026  
**Versão:** 1.0  
**Objetivo:** Validar fluxos críticos antes do lançamento Beta Privado

---

## 1. Fluxo de Onboarding (Crítico)

### Pré-condições
- Usuário não autenticado
- Navegador limpo (sem cookies)

### Passos
1. Acessar `https://neuroexecucao.app`
2. Clicar em "Entrar" ou "Começar Agora"
3. Fazer login via OAuth (Manus)
4. Aceitar consentimento LGPD
5. Preencher Wizard de Calibração (Etapa 1):
   - Selecionar granularidade (macro/meso/micro)
   - Selecionar estilo (top-down/bottom-up)
   - Definir capacidade cognitiva (minutos)
6. Submeter calibração

### Resultado Esperado
- ✅ Usuário é redirecionado para Dashboard
- ✅ Mensagem de boas-vindas aparece
- ✅ Calibração salva no banco (`user_calibration`)

### Critérios de Falha
- ❌ Erro 500 em qualquer etapa
- ❌ Redirecionamento para página em branco
- ❌ Calibração não salva (verificar no banco)

---

## 2. Fluxo de Criação de Projeto via Wizard (Crítico)

### Pré-condições
- Usuário autenticado
- Calibração já realizada

### Passos
1. Clicar em "Novo Projeto" no Dashboard
2. **Etapa 1 (Calibração):** Revisar perfil (já preenchido)
3. **Etapa 2 (Charter):** Descrever resultado desejado
   - Exemplo: "Criar um e-book de 50 páginas sobre produtividade para TDAH"
4. **Etapa 3 (Validação IA):** Aguardar análise SMART
   - Verificar se IA sugere reformulação (se necessário)
5. **Etapa 4 (Entregas):** Revisar entregas sugeridas pela IA
   - Exemplo: "Sumário estruturado", "Capítulos escritos", "Revisão final"
6. **Etapa 5 (Tarefas):** Revisar tarefas geradas
   - Verificar se tarefas têm verbos de ação
   - Verificar se duração está adequada ao perfil
7. **Etapa 6 (Distribuição):** Distribuir tarefas em 3 dias
8. **Etapa 7 (Revisão):** Confirmar e criar projeto

### Resultado Esperado
- ✅ Projeto criado com status "ACTIVE"
- ✅ Tarefas aparecem no Dashboard
- ✅ Primeira tarefa do dia está destacada
- ✅ Sistema A-B-C visível (Mínimo/Ideal/Excepcional)

### Critérios de Falha
- ❌ IA não responde (timeout > 30s)
- ❌ Tarefas geradas são vagas ("Planejar", "Pensar sobre")
- ❌ Distribuição de tarefas não respeita capacidade cognitiva

---

## 3. Fluxo de Timer Progressivo (Crítico)

### Pré-condições
- Usuário tem pelo menos 1 tarefa ativa

### Passos
1. No Dashboard, clicar em tarefa
2. Clicar em "Iniciar Timer"
3. Aguardar 10 segundos (timer deve contar para cima)
4. Clicar em "Pausar"
5. Aguardar 5 segundos (timer deve parar)
6. Clicar em "Retomar"
7. Aguardar 5 segundos (timer deve continuar)
8. Clicar em "Finalizar"
9. Confirmar conclusão da tarefa

### Resultado Esperado
- ✅ Timer conta segundos corretamente
- ✅ Pausar/Retomar funciona
- ✅ Tempo total é salvo em `focus_cycles`
- ✅ Tarefa marcada como concluída
- ✅ Próxima tarefa do dia é destacada

### Critérios de Falha
- ❌ Timer não inicia
- ❌ Timer não pausa
- ❌ Tempo não é salvo no banco

---

## 4. Fluxo "Onde Parei" (Importante)

### Pré-condições
- Usuário tem tarefas em andamento

### Passos
1. No Dashboard, localizar seção "Onde Parei"
2. Clicar em "Adicionar Nota"
3. Escrever contexto: "Parei na revisão do capítulo 3, falta ajustar referências"
4. Salvar nota
5. Fazer logout
6. Fazer login novamente
7. Verificar se nota aparece no Dashboard

### Resultado Esperado
- ✅ Nota salva em `session_notes`
- ✅ Nota aparece no próximo login
- ✅ Data da nota está correta

### Critérios de Falha
- ❌ Nota não salva
- ❌ Nota não aparece após login

---

## 5. Fluxo de Conversão Free → Pro (Crítico para Receita)

### Pré-condições
- Usuário em plano FREE
- Atingiu limite de 100 chamadas de IA/dia (ou simular)

### Passos
1. Tentar criar novo projeto (deve bloquear por limite)
2. Ver mensagem: "Você atingiu o limite de 100 análises de IA hoje. Faça upgrade para Pro."
3. Clicar em "Upgrade para Pro"
4. Ser redirecionado para Checkout Stripe
5. Preencher dados de cartão de teste: `4242 4242 4242 4242`
6. Confirmar pagamento
7. Aguardar webhook do Stripe
8. Verificar se plano mudou para "PRO"

### Resultado Esperado
- ✅ Checkout Stripe abre corretamente
- ✅ Pagamento processado
- ✅ Webhook atualiza `users.subscriptionPlan` para "PRO"
- ✅ Usuário pode criar projetos ilimitados

### Critérios de Falha
- ❌ Checkout não abre
- ❌ Webhook falha (plano não atualiza)
- ❌ Usuário paga mas continua FREE

---

## 6. Fluxo de Dashboard 2 Colunas (A/B Test)

### Pré-condições
- Usuário autenticado
- A/B test ativo (50% variante B)

### Passos
1. Acessar Dashboard
2. Verificar layout:
   - **Variante A:** 3 colunas (Hoje / Próximos / Concluídos)
   - **Variante B:** 2 colunas (Agora / Depois)
3. Completar 3 tarefas
4. Verificar se evento GA4 é disparado: `ab_test_dashboard_variant`

### Resultado Esperado
- ✅ 50% dos usuários veem variante B
- ✅ Evento GA4 registrado com `variant: 'A'` ou `variant: 'B'`
- ✅ Layout responsivo em mobile

### Critérios de Falha
- ❌ Todos veem mesma variante (A/B não funciona)
- ❌ Evento GA4 não dispara

---

## 7. Testes de Performance

### Objetivo
Validar que sistema suporta 200-500 usuários simultâneos

### Ferramenta
Artillery ou k6

### Comando
```bash
artillery quick --count 500 --num 10 https://neuroexecucao.app/api/trpc/projects.list
```

### Resultado Esperado
- ✅ P95 latency < 500ms
- ✅ 0% error rate
- ✅ Upstash Redis rate limiting funciona

### Critérios de Falha
- ❌ P95 latency > 1000ms
- ❌ Error rate > 1%
- ❌ Servidor cai (OOM)

---

## 8. Testes de Segurança

### 8.1 LGPD Compliance
- ✅ Checkbox de consentimento obrigatório
- ✅ Link para política de privacidade funciona
- ✅ Usuário pode exportar dados (GDPR)
- ✅ Usuário pode deletar conta

### 8.2 Autenticação
- ✅ Rotas protegidas redirecionam para login
- ✅ Token JWT expira após 7 dias
- ✅ Logout limpa cookies

### 8.3 Rate Limiting
- ✅ Usuário FREE bloqueado após 100 chamadas/dia
- ✅ IP bloqueado após 10 chamadas/hora (sem autenticação)
- ✅ Mensagem de erro clara

---

## 9. Testes de Regressão (Checklist Rápido)

- [ ] Login funciona
- [ ] Logout funciona
- [ ] Criar projeto funciona
- [ ] Editar projeto funciona
- [ ] Deletar projeto funciona
- [ ] Criar tarefa funciona
- [ ] Completar tarefa funciona
- [ ] Timer funciona
- [ ] "Onde Parei" funciona
- [ ] Dashboard carrega < 2s
- [ ] Mobile responsivo
- [ ] Stripe checkout funciona
- [ ] Webhook Stripe funciona

---

## 10. Critérios de Go/No-Go para Beta Privado

### ✅ GO (Pode lançar)
- Todos os fluxos críticos (1-5) funcionam
- 0 bugs bloqueadores
- Performance aceitável (P95 < 1s)
- LGPD compliance OK

### ❌ NO-GO (Não pode lançar)
- Qualquer fluxo crítico quebrado
- Pagamento não funciona
- Dados de usuário não são salvos
- Vazamento de dados (segurança)

---

## Próximos Passos

1. Executar testes E2E em staging
2. Documentar bugs encontrados
3. Corrigir bugs P0
4. Re-testar
5. Aprovar para produção
