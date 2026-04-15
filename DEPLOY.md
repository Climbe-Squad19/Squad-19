# Colocar Climbe online (resumo)

## Banco MySQL (obrigatório antes da API)

O app usa o schema do **`climbe_db.sql`** (Flyway aplica o mesmo em `V1__climbe_schema.sql`).

1. Crie um **MySQL 8** gerenciado (ex.: [PlanetScale](https://planetscale.com/), [Railway](https://railway.app/), Aiven, RDS, ClearDB).
2. Crie o database (ex.: `climbe`) e usuário **só com** `SELECT, INSERT, UPDATE, DELETE` nesse schema (não use `root` na aplicação).
3. Monte a JDBC URL (com TLS em produção), exemplo:
   `jdbc:mysql://HOST:3306/climbe?useSSL=true&serverTimezone=America/Sao_Paulo`
4. Defina no provedor da API: `MYSQL_URL`, `MYSQL_USERNAME`, `MYSQL_PASSWORD`.

## Backend (Docker / Render)

- **Docker local:** `cd gestao-contratos && docker compose up --build` (sobe MySQL + API).
- **Render:** use o `render.yaml` na raiz; preencha os *secrets* no dashboard (MySQL, `JWT_SECRET` longo e aleatório, Google OAuth, `APP_FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `GOOGLE_REDIRECT_URI` apontando para a URL **https** da API).
- **Google Cloud (OAuth):** cadastre **duas** URIs de redirecionamento autorizadas: `.../integracoes/google/callback` (integrações Drive/Calendar) e `.../auth/google/callback` (login com PKCE). Defina `GOOGLE_LOGIN_REDIRECT_URI` na API com a segunda URL pública.
- **MySQL no Mac:** se a instalação nativa falhar, use `docker compose up mysql` só o banco ou um serviço gerenciado (Railway/Aiven) e aponte `MYSQL_URL` para o host do container/serviço.

Variáveis importantes:

| Variável | Descrição |
|----------|-----------|
| `SPRING_PROFILES_ACTIVE` | `mysql` |
| `PORT` | Render injeta; localmente 8081 |
| `JWT_SECRET` | Obrigatório em produção (valor forte) |
| `APP_FRONTEND_URL` | URL do front (links de senha / OAuth) |
| `CORS_ALLOWED_ORIGINS` | Lista separada por vírgulas com a URL do front |

## Frontend (Vite)

No **build** (Render, Vercel, CI), defina:

`VITE_API_BASE_URL=https://<sua-api-publica>`

Depois do primeiro deploy da API, copie a URL e configure essa variável; faça **rebuild** do front.

## Commit

Na raiz do repositório:

```bash
git add -A
git status
git commit -m "chore: deploy — CORS/env, Docker Compose MySQL, Render blueprint"
git push
```
