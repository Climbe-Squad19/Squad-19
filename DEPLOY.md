# Deploy Climbe — stack e provedores

**Não commite senhas.** Use só os painéis (Railway, Render, Google).

---

## Stack recomendada (junto)

| Camada | Provedor | Motivo |
|--------|----------|--------|
| **MySQL 8** | [Railway](https://railway.app) | Rápido de criar, variáveis prontas, bom para time pequeno |
| **API + site** | [Render](https://render.com) | Já mapeado no `render.yaml` (Docker + static) |
| **Login Google / Calendar** | [Google Cloud Console](https://console.cloud.google.com) | OAuth 2.0 — duas redirect URIs na API |
| **E-mail (opcional)** | Gmail + [senha de app](https://myaccount.google.com/apppasswords) | Recuperação de senha e notificações |
| **Arquivos (opcional)** | [Supabase Storage](https://supabase.com) (S3-compatible) ou AWS S3 | Variáveis `SUPABASE_*` / `S3_*` no backend |

**Ordem de execução:** Railway (MySQL) → Google (OAuth, pode ser em paralelo) → Render **climbe-api** → copiar URL da API → Render **climbe-web** com `VITE_API_BASE_URL` → ajustar CORS e `APP_FRONTEND_URL` se precisar.

---

## 1. Anote as URLs (preencha depois dos deploys)

| Item | Onde pegar | Uso |
|------|------------|-----|
| URL da **API** | Render → serviço `climbe-api` → URL | CORS, `VITE_API_BASE_URL`, Google redirect URIs |
| URL do **front** | Render → `climbe-web` → URL | `APP_FRONTEND_URL`, CORS |
| **Host MySQL** | Railway → serviço MySQL → *Variables* ou *Connect* | Montar `MYSQL_URL` |

Exemplo de nomes Render (você pode renomear no painel):

- API: `https://climbe-api.onrender.com`
- Site: `https://climbe-web.onrender.com`

Substitua nos passos abaixo pelas URLs **reais** que aparecerem no seu dashboard.

---

## 2. MySQL no Railway (provedor concreto)

1. Acesse [railway.app](https://railway.app) → login com GitHub (ou conta).
2. **New project** → **Provision MySQL** (ou **Empty project** → **+ New** → **Database** → **MySQL**).
3. Abra o serviço **MySQL** → aba **Variables** (ou **Connect**).
4. Anote: **host**, **porta** (geralmente `3306`), **usuário**, **senha**, nome lógico do database (Railway costuma criar um DB; pode ser `railway` — você pode criar `climbe` no cliente SQL se quiser separar).
5. **Criar database `climbe`** (recomendado, alinhado ao projeto):
   - Use **Query** no Railway ou um cliente local com SSL:
   - `CREATE DATABASE IF NOT EXISTS climbe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
   - Dê ao usuário da aplicação permissão nesse schema (ou use o usuário root só em dev; em time, usuário dedicado).
6. Monte o **`MYSQL_URL`** (JDBC) — um modelo que costuma funcionar com Railway + SSL:

```text
jdbc:mysql://HOST:PORTA/climbe?useSSL=true&serverTimezone=America/Sao_Paulo&allowPublicKeyRetrieval=true&characterEncoding=utf8
```

- Troque `HOST`, `PORTA` e o nome do database se não for `climbe`.
- Se der erro de SSL, teste `useSSL=false` só para isolar o problema (em produção prefira SSL conforme a doc do Railway).

**`MYSQL_USERNAME` / `MYSQL_PASSWORD`:** exatamente como no painel Railway (não inclua na URL JDBC se já separar no Render).

**Flyway:** na primeira subida da API, o usuário precisa de permissão para criar tabelas **ou** você importa `climbe_db.sql` uma vez no painel SQL.

### Outras opções de MySQL (se não usar Railway)

| Provedor | Link | Observação |
|----------|------|------------|
| **Aiven** | [aiven.io](https://aiven.io) | MySQL gerenciado; copie host/porta/usuário do painel |
| **AWS RDS** | [RDS MySQL](https://aws.amazon.com/rds/mysql/) | Produção séria; VPC/security groups |
| **Oracle MySQL Heatwave** / **Azure MySQL** | — | Enterprise |

Evite misturar **Neon/Supabase Postgres** como substituto do MySQL — o projeto é **MySQL** (Flyway/JPA).

---

## 3. Back-end no Render (`climbe-api`)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint** → conecte o repositório com o `render.yaml` na raiz.
2. Confirme os dois serviços: **`climbe-api`** (Docker) e **`climbe-web`** (static).
3. No **`climbe-api`**, preencha **Environment** (secrets):

| Variável | Valor |
|----------|--------|
| `SPRING_PROFILES_ACTIVE` | `mysql` |
| `MYSQL_URL` | JDBC da seção 2 |
| `MYSQL_USERNAME` | usuário MySQL |
| `MYSQL_PASSWORD` | senha MySQL |
| `JWT_SECRET` | string longa aleatória (64+ caracteres) |
| `APP_FRONTEND_URL` | `https://SEU-climbe-web.onrender.com` (URL real do static) |
| `CORS_ALLOWED_ORIGINS` | a mesma URL do front; várias: `https://a.com,https://b.com` (vírgula, sem espaço) |
| `GOOGLE_CLIENT_ID` | Google Cloud |
| `GOOGLE_CLIENT_SECRET` | Google Cloud |
| `GOOGLE_REDIRECT_URI` | `https://SUA-API.onrender.com/integracoes/google/callback` |
| `GOOGLE_LOGIN_REDIRECT_URI` | `https://SUA-API.onrender.com/auth/google/callback` |

**Porta:** o `render.yaml` define `PORT=8081`. O Spring usa `${PORT}`. Se o health check falhar, nos logs aparece porta errada — aí remova `PORT` do ambiente no Render e deixe a plataforma injetar (ou alinhe com a doc Render + Docker).

**Health:** `healthCheckPath`: `/actuator/health`.

### Opcionais — API

| Variável | Uso |
|----------|-----|
| `MAIL_USERNAME`, `MAIL_APP_PASSWORD`, `MAIL_FROM`, `MAIL_PROVIDER=gmail.com` | E-mail (Gmail: senha de app) |
| `MANAGEMENT_HEALTH_MAIL_ENABLED` | `false` se não tiver SMTP (evita health DOWN por mail) |
| `SUPABASE_STORAGE_ENABLED`, `SUPABASE_*` ou `S3_*` | Upload de documentos |

---

## 4. Google Cloud — OAuth (concreto)

1. [APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials).
2. **Create credentials** → **OAuth client ID** → tipo **Web application**.
3. **Authorized JavaScript origins** (se o console pedir):  
   - `https://SEU-climbe-web.onrender.com`
4. **Authorized redirect URIs** — **obrigatório**, duas linhas **iguais** às variáveis no Render:
   - `https://SUA-API.onrender.com/integracoes/google/callback`
   - `https://SUA-API.onrender.com/auth/google/callback`
5. Copie **Client ID** e **Client Secret** para o Render.

Tela de consentimento OAuth: em **Testing**, adicione e-mails de teste; para produção, publique o app (fluxo de verificação do Google).

---

## 5. Front no Render (`climbe-web`)

| Variável de build | Valor |
|-------------------|--------|
| `VITE_API_BASE_URL` | `https://SUA-API.onrender.com` — **sem** barra no final |

Depois de mudar a URL da API, faça **Clear build cache** + **Deploy** no `climbe-web`.

Referência local: `frontend/.env.example`.

---

## 6. E-mail (Gmail) — opcional

1. Conta Google → [Senhas de app](https://myaccount.google.com/apppasswords) (2FA obrigatório).
2. Gere uma senha para “Mail”.
3. No Render: `MAIL_USERNAME` = seu e-mail Gmail, `MAIL_APP_PASSWORD` = senha de app, `MAIL_FROM` = mesmo remetente.

---

## 7. Storage de arquivos — opcional (Supabase)

1. Projeto no Supabase → **Storage** → bucket.
2. No backend, use as variáveis documentadas em `application.properties` (`SUPABASE_STORAGE_*` ou S3 genérico).

---

## 8. Conferência

```bash
curl -sS "https://SUA-API.onrender.com/actuator/health"
```

```bash
curl -sS -X POST "https://SUA-API.onrender.com/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@climbe.com","senha":"SUA_SENHA"}'
```

---

## 9. Problemas comuns

| Sintoma | O que checar |
|---------|----------------|
| API não sobe | Logs Render; `MYSQL_*`; SSL na JDBC |
| CORS | `CORS_ALLOWED_ORIGINS` = URL exata do front (https) |
| Google `redirect_uri_mismatch` | URIs no Google = variáveis `GOOGLE_*` no Render, caractere a caractere |
| Front em localhost | `VITE_API_BASE_URL` só no **build** — rebuild |

---

## 10. Git (só quando houver mudanças de código)

```bash
git add -A && git status
git commit -m "chore: ajustes de deploy"
git push
```
