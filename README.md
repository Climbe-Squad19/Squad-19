# Squad 19 - Climbe

Token JWT
Todos os endpoints precisam do token JWT no header, exceto:
POST /auth/login    → não precisa de token
POST /usuarios      → não precisa de token

Como obter o token

1- Criar usuário

POST http://localhost:8080/usuarios

Exemplo:
{
  "nomeCompleto": "João Silva",
  "cargo": "ANALISTA_SENIOR",
  "permissoes": ["ANALISTA_SENIOR"],
  "cpf": "12345678901",
  "email": "joao@climbe.com",
  "telefone": "79999999999",
  "senha": "123456"
}


2 - Fazer Login
POST http://localhost:8080/auth/login
{
  "email": "joao@climbe.com",
  "senha": "123456"
}

Copie o accessToken retornado.

Aba Authorization → Type: Bearer Token → Cole o token no campo Token