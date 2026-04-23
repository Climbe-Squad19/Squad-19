# Squad 19 — Climbe

## Desenvolvimento local (chegar e rodar)

**Requisitos:** Java 17+, Docker (para MySQL), Node 18+ (frontend), Maven Wrapper no backend (`gestao-contratos/./mvnw`).

1. **Clonar** o repositório e, na **raiz**, criar os `.env` a partir dos exemplos:

   ```bash
   npm run init
   ```

   Isso copia `gestao-contratos/.env.example` → `gestao-contratos/.env` e `frontend/.env.example` → `frontend/.env` (só se ainda não existirem).

2. **Preencher** `gestao-contratos/.env` com **GOOGLE_CLIENT_ID** e **GOOGLE_CLIENT_SECRET** (OAuth no Google Cloud Console). As variáveis **MySQL** já vêm alinhadas ao Docker (porta **3307** no host para não conflitar com MySQL nativo na 3306).

3. **Instalar** dependências do frontend:

   ```bash
   npm run install:all
   ```

4. **Subir** em **dois terminais** (na raiz do repo):

   | Terminal | Comando | O que faz |
   |----------|---------|-----------|
   | 1 | `npm run dev:api` | Sobe MySQL no Docker (se necessário) e a API Spring na **8081** (perfil **mysql**, Flyway). |
   | 2 | `npm run dev:web` | Sobe o Vite em **5173** com `VITE_API_BASE_URL` do `frontend/.env`. |

5. **Validar** (com a API já rodando):

   ```bash
   npm run validate
   ```

   Ou manualmente: `curl -s http://127.0.0.1:8081/actuator/health` — o componente `db` deve indicar **MySQL**, não H2.

**Sem npm na raiz:** use `bash scripts/init-local.sh`, depois `cd gestao-contratos && ./run-dev-mysql.sh` e `cd frontend && npm run dev`.

**Docker Compose:** se o plugin `docker compose` estiver instalado, `run-dev-mysql.sh` usa o serviço `mysql` do `docker-compose.yaml`. Caso contrário, o script sobe o container com `docker run` (`climbe-mysql`).

---

## Autenticação (JWT)

Todos os endpoints precisam do token JWT no header, exceto:

- `POST /auth/login` → não precisa de token  
- `POST /usuarios` → não precisa de token  

**Base URL local da API:** `http://localhost:8081` (não 8080).

### Como obter o token

1. **Criar usuário**

   `POST http://localhost:8081/usuarios`

   Exemplo:

   ```json
   {
     "nomeCompleto": "João Silva",
     "cargo": "ANALISTA_SENIOR",
     "permissoes": ["ANALISTA_SENIOR"],
     "cpf": "12345678901",
     "email": "joao@climbe.com",
     "telefone": "79999999999",
     "senha": "123456"
   }
   ```

2. **Login**

   `POST http://localhost:8081/auth/login`

   ```json
   {
     "email": "joao@climbe.com",
     "senha": "123456"
   }
   ```

   Copie o `accessToken` retornado.

No Swagger ou cliente HTTP: **Authorization → Bearer Token** e cole o token.
