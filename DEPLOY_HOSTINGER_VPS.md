# Guia de Deploy: NeuroExecução em VPS Hostinger

**Plataforma:** Hostinger VPS  
**Sistema Operacional:** Ubuntu 22.04 (Recomendado)  
**Data:** 12 de Janeiro de 2026

---

## 🚀 Introdução

Este guia detalha o processo completo para implantar o projeto **NeuroExecução** em uma VPS da Hostinger, desde a configuração inicial do servidor até a publicação do site com um domínio e SSL (HTTPS).

O processo foi dividido em 7 etapas principais. Recomendo seguir a ordem para garantir que todas as dependências e configurações sejam aplicadas corretamente.

---

## Etapa 1: Configuração Inicial do Servidor

Primeiro, acesse sua VPS via SSH. Substitua `IP_DA_SUA_VPS` pelo endereço de IP do seu servidor.

```bash
ssh root@IP_DA_SUA_VPS
```

**1.1. Atualizar o Sistema**

Garanta que todos os pacotes do sistema estejam atualizados.

```bash
sudo apt update && sudo apt upgrade -y
```

**1.2. Criar um Usuário Não-Root**

Por segurança, não é recomendado executar aplicações como `root`. Vamos criar um novo usuário chamado `neuro`.

```bash
adduser neuro
# Você será solicitado a criar uma senha e preencher algumas informações.

# Adicione o novo usuário ao grupo 'sudo' para dar privilégios de administrador
usermod -aG sudo neuro

# Faça login como o novo usuário
su - neuro
```

> **Nota:** A partir de agora, todos os comandos devem ser executados como o usuário `neuro`.

---

## Etapa 2: Instalação das Dependências

Vamos instalar o ambiente necessário para rodar a aplicação: Node.js, pnpm, MySQL e Nginx.

**2.1. Instalar Node.js via NVM**

Usaremos o NVM (Node Version Manager) para instalar e gerenciar as versões do Node.js.

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Carregue o NVM no terminal atual
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Instale a versão 22 do Node.js
nvm install 22
nvm use 22
nvm alias default 22
```

**2.2. Instalar pnpm**

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -

# Carregue o pnpm no terminal atual
source /home/neuro/.bashrc
```

**2.3. Instalar MySQL Server**

```bash
sudo apt install mysql-server -y
```

**2.4. Instalar Nginx (Servidor Web)**

```bash
sudo apt install nginx -y
```

**2.5. Instalar PM2 (Gerenciador de Processos)**

O PM2 garantirá que sua aplicação reinicie automaticamente se falhar e após o boot do servidor.

```bash
pnpm install -g pm2
```

---

## Etapa 3: Configuração do Banco de Dados

**3.1. Configurar Senha do Root do MySQL**

Por padrão, o MySQL no Ubuntu usa autenticação via socket. Vamos definir uma senha para o usuário `root`.

```bash
sudo mysql -u root

# Dentro do prompt do MySQL, execute:
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'SUA_SENHA_FORTE_AQUI';
FLUSH PRIVILEGES;
EXIT;
```

**3.2. Criar o Banco de Dados e Usuário da Aplicação**

Vamos criar um banco de dados e um usuário específico para o NeuroExecução.

```bash
sudo mysql -u root -p
# Digite a senha que você acabou de criar

# Dentro do prompt do MySQL, execute:
CREATE DATABASE neuroplan;
CREATE USER 'neuro_user'@'localhost' IDENTIFIED BY 'SENHA_DO_APP_AQUI';
GRANT ALL PRIVILEGES ON neuroplan.* TO 'neuro_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Etapa 4: Deploy do Código

**4.1. Clonar o Repositório**

```bash
cd ~ # Vá para a home do usuário 'neuro'
git clone https://github.com/directjervis-svg/neuroplan.git
```

**4.2. Instalar Dependências do Projeto**

```bash
cd neuroplan
pnpm install
```

**4.3. Configurar Variáveis de Ambiente**

Copie o arquivo de exemplo e edite-o com suas credenciais.

```bash
cp .env.example .env
nano .env
```

Preencha o arquivo `.env` com as informações corretas. O `DATABASE_URL` deve ser:

```
DATABASE_URL="mysql://neuro_user:SENHA_DO_APP_AQUI@localhost:3306/neuroplan"
```

> Deixe as chaves do Stripe e Google Analytics como placeholders por enquanto.

**4.4. Executar Migrações do Banco de Dados**

```bash
pnpm db:push
```

**4.5. Fazer o Build de Produção**

```bash
pnpm build
```

---

## Etapa 5: Configuração do Nginx (Reverse Proxy)

O Nginx atuará como um proxy reverso, recebendo as requisições na porta 80 (HTTP) e 443 (HTTPS) e as redirecionando para a aplicação Node.js, que roda na porta 3000.

**5.1. Criar o Arquivo de Configuração do Nginx**

Substitua `seu-dominio.com` pelo seu domínio real.

```bash
sudo nano /etc/nginx/sites-available/neuroplan
```

Cole o seguinte conteúdo no arquivo:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**5.2. Ativar a Configuração**

Crie um link simbólico para habilitar o site.

```bash
sudo ln -s /etc/nginx/sites-available/neuroplan /etc/nginx/sites-enabled/

# Teste a configuração do Nginx
sudo nginx -t

# Reinicie o Nginx
sudo systemctl restart nginx
```

Neste ponto, seu site já deve estar acessível via HTTP em `http://seu-dominio.com`.

---

## Etapa 6: Configuração de SSL com Certbot (HTTPS)

**6.1. Instalar o Certbot**

O Certbot é uma ferramenta que automatiza a obtenção e renovação de certificados SSL gratuitos da Let's Encrypt.

```bash
sudo apt install certbot python3-certbot-nginx -y
```

**6.2. Obter o Certificado SSL**

O Certbot irá ler sua configuração do Nginx, obter o certificado e configurar o HTTPS automaticamente.

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

> Siga as instruções na tela. Recomenda-se escolher a opção para redirecionar todo o tráfego HTTP para HTTPS.

O Certbot também configurará a renovação automática.

---

## Etapa 7: Iniciar a Aplicação com PM2

Finalmente, vamos iniciar a aplicação Node.js usando o PM2.

**7.1. Iniciar o Servidor**

```bash
cd ~/neuroplan
NODE_ENV=production pm2 start dist/index.js --name "neuroplan-app"
```

**7.2. Configurar o PM2 para Iniciar com o Boot do Servidor**

```bash
pm2 startup
# Siga as instruções que aparecerão na tela (geralmente, copiar e colar um comando com 'sudo')

pm2 save
```

**7.3. Verificar Status**

Verifique se a aplicação está rodando:

```bash
pm2 status
```

---

## ✅ Conclusão

Seu site **NeuroExecução** agora está implantado permanentemente em sua VPS Hostinger, acessível em `https://seu-dominio.com`.

### Para Atualizar o Site no Futuro:

1. Acesse a VPS: `ssh neuro@IP_DA_SUA_VPS`
2. Navegue até a pasta do projeto: `cd ~/neuroplan`
3. Puxe as últimas alterações do GitHub: `git pull origin main`
4. Instale qualquer nova dependência: `pnpm install`
5. Faça o build novamente: `pnpm build`
6. Reinicie a aplicação com PM2: `pm2 restart neuroplan-app`
