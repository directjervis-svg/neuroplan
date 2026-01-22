# Diretrizes de Contribuição para NeuroExecução

Agradecemos o seu interesse em contribuir para o projeto NeuroExecução! Sua ajuda é fundamental para aprimorar esta ferramenta de gestão de projetos neuroadaptada.

## 1. Código de Conduta

Este projeto adota o Código de Conduta do Contributor Covenant. Ao participar, você concorda em seguir este código. Por favor, reporte comportamentos inaceitáveis para [seu-email-aqui].

## 2. Como Contribuir

Existem diversas formas de contribuir:

### 2.1. Reportando Bugs

Se você encontrar um bug, por favor, abra uma *Issue* no GitHub e utilize o template de registro de bugs disponível em `docs/TEMPLATE_REGISTRO_BUGS.md`.

**Informações Essenciais:**
-   **Passos para Reproduzir:** Descreva exatamente como o bug pode ser replicado.
-   **Comportamento Esperado:** O que deveria ter acontecido.
-   **Comportamento Atual:** O que realmente aconteceu.
-   **Ambiente:** Versão do Node.js, Navegador, Sistema Operacional.

### 2.2. Sugerindo Funcionalidades

Para sugerir novas funcionalidades, abra uma *Issue* e descreva a sua ideia em detalhes. Inclua o caso de uso e o valor que a funcionalidade trará para os usuários com TDAH.

### 2.3. Submetendo Pull Requests (PRs)

1.  **Faça um Fork** do repositório.
2.  **Clone** o seu fork localmente.
3.  Crie uma **branch** para a sua contribuição: `git checkout -b feature/nome-da-funcionalidade` ou `fix/correcao-do-bug`.
4.  **Instale as dependências:** `pnpm install`.
5.  **Desenvolva** sua funcionalidade ou correção.
6.  **Execute os testes** para garantir que nada foi quebrado: `pnpm test`.
7.  **Verifique a tipagem** do TypeScript: `pnpm check`.
8.  **Formate o código:** `pnpm format`.
9.  **Commit** suas alterações com mensagens claras e descritivas.
10. **Envie** sua branch para o seu fork: `git push origin feature/nome-da-funcionalidade`.
11. Abra um **Pull Request** para a branch `main` do repositório original.

**Requisitos do PR:**
-   O PR deve ser atômico (focar em uma única funcionalidade ou correção).
-   Todos os testes devem passar.
-   O código deve seguir o estilo de formatação do projeto (verificado por `pnpm format`).

## 3. Configuração do Ambiente de Desenvolvimento

Siga as instruções detalhadas no `README.md` para configurar seu ambiente.

---
*Obrigado por ajudar a construir o NeuroExecução!*
