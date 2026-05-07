# Squad 19 — Climbe Investimentos

> Sistema de gestão e gerenciamento de contratos desenvolvido para a **Climbe Investimentos** em parceria com a **Universidade Tiradentes** e o **Porto Digital**, no âmbito da disciplina de **Residência de Software**.

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Pré-requisitos](#pré-requisitos)
- [Como Rodar Localmente](#como-rodar-localmente)
- [Autenticação JWT](#autenticação-jwt)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Módulos do Sistema](#módulos-do-sistema)
- [Integrações Externas](#integrações-externas)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)

---

## Sobre o Projeto

Plataforma web corporativa voltada à gestão de empresas, contratos, propostas comerciais, reuniões, usuários e documentos. A solução adota uma arquitetura em camadas com separação clara entre frontend, backend e persistência de dados.

O sistema cobre desde a autenticação dos usuários até o gerenciamento completo dos contratos, com integração às APIs do Google (Sheets, Drive, Calendar e Gmail) e controle de acesso baseado em cargos e perfis.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + TypeScript + Vite |
| Backend | Java + Spring Boot 3 |
| Banco de dados (dev) | H2 in-memory |
| Banco de dados (produção) | MySQL 8+ |
| Segurança | Spring Security + JWT |
| Estado global | Redux Toolkit |
| Formulários | React Hook Form + Zod |
| Estilização | CSS customizado + MUI |
| Versionamento | Git + GitHub |

---

## Estrutura do Repositório

```
Squad-19/
├── frontend/                  # Aplicação React (Vite + TypeScript)
│   ├── src/
│   │   ├── assets/            # Imagens e SVGs (logo, etc.)
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas principais (Dashboard, Login)
│   │   ├── services/          # Camada de chamadas à API REST
│   │   ├── store/             # Redux (estado global)
│   │   ├── utils/             # Funções utilitárias
│   │   ├── styles.css         # Estilos globais
│   │   └── theme.ts           # Tema MUI
│   └── .env.example
├── gestao-contratos/          # API Spring Boot (Java)
│   ├── src/main/java/...
│   │   ├── controllers/       # Endpoints REST
│   │   ├── services/          # Regras de negócio
│   │   ├── repositories/      # Acesso a dados (JPA)
│   │   ├── dto/               # Objetos de transferência
│   │   └── Security/          # JWT, filtros e configurações
│   └── .env.example
├── scripts/                   # Scripts auxiliares de setup
├── docs/                      # Documentação adicional
├── climbe_db.sql              # Script SQL do banco de dados
├── docker-compose.yaml        # MySQL via Docker
└── package.json               # Scripts npm raiz
```

---

## Pré-requisitos

Antes de rodar o projeto, certifique-se de ter instalado:

- **Java 17+** — backend Spring Boot
- **Node.js 18+** — frontend React
- **MySQL 8+** — banco de dados (local ou via Docker)
- **Docker Desktop** *(opcional)* — para subir o MySQL automaticamente
- **Git** — versionamento

Para verificar se já estão instalados:
```bash
java -version
node -v
docker -v
```

---

## Como Rodar Localmente

### 1. Clone o repositório

```bash
git clone https://github.com/Climbe-Squad19/Squad-19.git
cd Squad-19
```

### 2. Crie os arquivos `.env`

```bash
npm run init
```

Isso copia `.env.example` → `.env` em ambas as pastas (`gestao-contratos/` e `frontend/`).

**Sem npm na raiz:**
```bash
bash scripts/init-local.sh
```

### 3. Preencha as variáveis de ambiente

Edite `gestao-contratos/.env` com suas credenciais (veja [Variáveis de Ambiente](#variáveis-de-ambiente)).

### 4. Instale as dependências do frontend

```bash
npm run install:all
```

### 5. Suba o projeto em dois terminais

| Terminal | Comando | O que faz |
|----------|---------|-----------|
| 1 | `npm run dev:api` | Sobe o MySQL (Docker ou local) e a API Spring Boot na porta **8081** |
| 2 | `npm run dev:web` | Sobe o frontend Vite na porta **5173** |

**Sem Docker (MySQL instalado localmente):**

No terminal do backend, use diretamente:
```bash
cd gestao-contratos
.\mvnw.cmd spring-boot:run   # Windows
./mvnw spring-boot:run       # Linux/Mac
```

### 6. Acesse o sistema

| URL | Descrição |
|-----|-----------|
| `http://localhost:5173` | Frontend (interface do usuário) |
| `http://localhost:8081` | API REST (backend) |
| `http://localhost:8081/swagger-ui.html` | Documentação interativa da API |
| `http://localhost:8081/actuator/health` | Health check da API |

### 7. Validação

```bash
npm run validate
```

O componente `db` deve indicar **MySQL** (ou H2 em modo local), confirmando que a API está saudável.

---

## Autenticação JWT

Todos os endpoints exigem token JWT no header, **exceto**:

- `POST /auth/login`
- `POST /usuarios`

### Criando o primeiro usuário

```bash
POST http://localhost:8081/usuarios
Content-Type: application/json

{
  "nomeCompleto": "Nome Completo",
  "cargo": "ANALISTA_SENIOR",
  "permissoes": ["ANALISTA_SENIOR"],
  "cpf": "12345678901",
  "email": "usuario@climbe.com",
  "telefone": "79999999999",
  "senha": "suasenha"
}
```

### Fazendo login

```bash
POST http://localhost:8081/auth/login
Content-Type: application/json

{
  "email": "usuario@climbe.com",
  "senha": "suasenha"
}
```

Copie o `accessToken` retornado e use como **Bearer Token** em todas as requisições seguintes.

No Swagger: clique em **Authorize** e cole o token no campo `Bearer Token`.

---

## Variáveis de Ambiente

### `gestao-contratos/.env`

```env
# Perfil ativo: "local" (H2) ou "mysql" (MySQL)
SPRING_PROFILES_ACTIVE=mysql

# MySQL
MYSQL_HOST_PORT=3306
MYSQL_URL=jdbc:mysql://127.0.0.1:3306/climbe?createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=utf8&serverTimezone=America/Sao_Paulo&allowPublicKeyRetrieval=true&useSSL=false
MYSQL_USERNAME=root
MYSQL_PASSWORD=sua_senha_mysql

# Google OAuth 2.0 (obrigatório para login com Google)
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret

# JWT
JWT_SECRET=sua_chave_secreta_com_32_caracteres

# E-mail (opcional)
MAIL_USERNAME=seu@gmail.com
MAIL_APP_PASSWORD=sua_senha_de_app
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8081
```

### Como obter as credenciais do Google

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um projeto (ou use um existente)
3. Vá em **APIs e serviços → Credenciais**
4. Clique em **Criar credenciais → ID do cliente OAuth 2.0**
5. Tipo: **Aplicativo da Web**
6. Em "URIs de redirecionamento autorizados" adicione: `http://localhost:8081/auth/google/callback`
7. Copie o **Client ID** e o **Client Secret**

---

## Módulos do Sistema

| Módulo | Descrição |
|--------|-----------|
| Autenticação | Login por e-mail/senha e OAuth 2.0 (Google) com JWT |
| Dashboard | Visão geral com indicadores, calendário e contratos recentes |
| Agenda | Visualização semanal e mensal de reuniões e compromissos |
| Propostas Comerciais | Kanban com fluxo de aprovação de propostas |
| Clientes / Empresas | Cadastro e gestão de empresas contratantes |
| Equipe | Gestão de usuários, cargos e permissões |
| Configurações | Perfil, segurança, notificações e integrações Google |

### Cargos disponíveis

- `CEO`
- `COMPLIANCE`
- `MEMBRO_CONSELHO`
- `CSO`
- `CMO`
- `CFO`
- `ANALISTA_SENIOR`
- `ANALISTA_PLENO`
- `ANALISTA_JUNIOR`
- `ANALISTA_TRAINEE`
- `ANALISTA_BPO`

---

## Integrações Externas

| Serviço | Finalidade |
|---------|-----------|
| Google Drive | Armazenamento e recuperação de documentos |
| Google Calendar | Agendamento e sincronização de reuniões |
| Gmail | Envio de notificações e alertas por e-mail |
| Google Sheets | Planilhas gerenciais dos contratos |
| Swagger / OpenAPI | Documentação interativa da API REST |

---

## Deploy

O projeto está configurado para deploy no **Railway** (arquivo `render.yaml` e variáveis de produção).

Para o deploy funcionar corretamente, configure as variáveis de ambiente no painel do Railway com os mesmos valores do `.env`, substituindo o host do MySQL e as URLs de callback do Google pelo domínio de produção.

**URL de produção:** `https://climbe-web-production.up.railway.app`

---

## Contribuindo

### Fluxo de trabalho com branches

```bash
# Atualize a main local
git checkout main
git pull origin main

# Volte para sua branch e traga as atualizações
git checkout sua-branch
git merge main

# Faça suas alterações e commite
git add .
git commit -m "tipo: descrição clara da alteração"
git push origin sua-branch
```

### Padrão de commits

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `style` | Alterações visuais/CSS |
| `refactor` | Refatoração sem mudança de comportamento |
| `docs` | Documentação |

---

Desenvolvido pelo **Squad 19** — Residência de Software · UNIT × Porto Digital × Climbe Investimentos
