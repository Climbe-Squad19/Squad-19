
---

## 🎯 O que foi implementado

### 1. Filtros de usuários por cargo
- Novo endpoint: `GET /usuarios/analistas`
- Retorna só usuários que são analistas (TRAINEE, JUNIOR, PLENO, SENIOR, BPO)

- Novo endpoint: `GET /usuarios/gestores`
- Retorna gestores (CMO, CSO, CEO, CFO)

### 2. Atribuição de responsável por contrato
- Novo endpoint: `PATCH /contratos/{id}/responsavel`
- Como usar:
  ```json
  {
    "usuarioResponsavelId": 123
  }
  ```
- Validação: Só permite usuários com cargos específicos (analistas + gestores)

---

## � Swagger / OpenAPI
A API agora inclui documentação Swagger para testes.

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Para iniciar o backend e testar:

```bash
cd gestao-contratos
./mvnw spring-boot:run
```

---

## �🔧 Arquivos que mexi

### Backend

#### `UsuarioRepository.java`
- **Por que?** Precisávamos filtrar usuários por múltiplos cargos (analistas e gestores)
- **O que foi adicionado?** Método `findByCargoIn(List<Cargo> cargos)` para buscar usuários com cargos específicos
- **Impacto**: Nenhum - apenas nova funcionalidade sem mexer no que já existia

#### `UsuarioService.java`
- **Por que?** Para facilitar a busca de usuários por grupo de cargo (analistas, gestores, etc)
- **O que foi adicionado?** 
  - Método `listarPorCargos(List<Cargo> cargos)` - genérico para qualquer grupo de cargo
  - Método `listarAnalistas()` - retorna especificamente usuários analistas
  - Import da classe `Cargo`
- **Impacto**: Adiciona novas funcionalidades, mantém métodos antigos intactos

#### `UsuarioController.java`
- **Por que?** Deixar acessível via API os novos filtros de usuários
- **O que foi adicionado?** 
  - Endpoint `GET /usuarios/analistas` - lista analistas
  - Endpoint `GET /usuarios/gestores` - lista gestores (CMO, CSO, CEO, CFO)
- **Impacto**: Novos endpoints, endpoints antigos continuam iguais

#### `ContratoService.java`
- **Por que?** Implementar a lógica de designar responsáveis aos contratos
- **O que foi adicionado?** 
  - Método `atribuirResponsavel(Long contratoId, Long usuarioResponsavelId)`
  - Validação de cargo - verifica se o usuário tem permissão para ser responsável
- **Impacto**: Novo método que complementa o contrato, sem alterar métodos existentes

#### `ContratoController.java`
- **Por que?** Exposição da funcionalidade de atribuição de responsável via API
- **O que foi adicionado?** 
  - Endpoint `PATCH /contratos/{id}/responsavel` 
  - Import da anotação `@PatchMapping`
  - Import do novo DTO `ContratoResponsavelRequest`
- **Impacto**: Novo endpoint HTTP, outros endpoints permanecem iguais

#### `ContratoResponsavelRequest.java` (**NOVO**)
- **Por que?** Seguir padrão de projeto - separar DTOs para cada tipo de requisição
- **O que foi adicionado?** 
  - Nova classe DTO com campo `usuarioResponsavelId`
  - Anotações Lombok para gerar getters/setters/equals/hashcode
- **Impacto**: Zero - criação de novo arquivo sem afetar nada

#### `ApiIntegrationService.java` (**NOVO**)
- **Por que?** Centralizar a integração com APIs externas em um serviço específico
- **O que foi adicionado?** 
  - Novo serviço com WebClient injected
  - Método `buscarPropostaExterna(Long propostaId)` para chamar API externa
  - Leitura de URL base via `@Value` do `application.properties`
- **Impacto**: Zero - novo serviço sem afetar código existente

#### `SecurityConfig.java`
- **Por que?** Seguir padrão do Spring Boot 3.5.x e melhorar performance nas chamadas HTTP
- **O que foi adicionado?** 
  - Bean `WebClient` para injeção de dependência
  - Import `org.springframework.web.reactive.function.client.WebClient`
- **O que foi removido?** 
  - Bean `RestTemplate` (era a forma antiga de fazer chamadas HTTP)
  - Import de `RestTemplate` (deixou de ser necessário)
- **Por que removeu?** `WebClient` é mais moderno, reativo e otimizado. `RestTemplate` é legado

#### `PropostaController.java`
- **Por que?** Deixar acessível a integração com API externa de propostas
- **O que foi adicionado?** 
  - Injeção do `ApiIntegrationService` no constructor
  - Endpoint `GET /propostas/{id}/external` para buscar proposta de sistema externo
- **Impacto**: Novo endpoint, endpoints antigos continuam iguais

#### `pom.xml`
- **Por que?** O Project Object Model precisa conhecer a dependência do WebClient
- **O que foi adicionado?** 
  - Dependência `org.springframework:spring-webflux` (necessária para WebClient)
  - Dependência `org.springframework:spring-web` (reforça suporte HTTP)
- **Impacto**: Maven agora baixa essas bibliotecas, nenhum impacto no código

#### `application.properties`
- **Por que?** Configurar a URL da API externa sem hardcoding no código
- **O que foi adicionado?** 
  - Propriedade `external.api.base-url=https://api.example.com`
- **Como usar?** Troque a URL quando tiver o endpoint real da API externa
- **Impacto**: Zero - configuração, sem afetar o código

---

## ✅ O que funciona igual

- Todos os endpoints CRUD que já existiam continuam iguais
- Estrutura do banco não mudou
- Validações existentes não foram alteradas
- Segurança e autenticação continuam do mesmo jeito
- Todas as entidades (Usuario, Empresa, Contrato, etc.) não foram modificadas

---

## 🧪 Como testar

### 1. Listar analistas
```bash
GET /usuarios/analistas
```

### 2. Listar gestores
```bash
GET /usuarios/gestores
```

### 3. Atribuir responsável a contrato
```bash
PATCH /contratos/1/responsavel
Content-Type: application/json

{
  "usuarioResponsavelId": 2
}
```

### 4. Buscar proposta externa
```bash
GET /propostas/1/external
```

---

## ⚠️ Pontos importantes

- **Validação de cargo**: Só analistas e gestores podem ser responsáveis por contratos
- **API externa**: Configure a URL no `application.properties` quando for usar de verdade
- **Compatibilidade**: Nada quebrou, tudo continua funcionando
- **Testes**: Rodei os testes e tudo passou

---

## Notificacao por Gmail

As notificacoes por e-mail ja estao integradas no backend e sao disparadas no agendamento de reunioes.

### Opcao recomendada (mais simples): Gmail SMTP

1. Ative 2FA na conta Google.
2. Gere uma App Password em Seguranca > Senhas de app.
3. Exporte as variaveis de ambiente antes de subir o backend:

```bash
export MAIL_PROVIDER=smtp
export MAIL_USERNAME=seuemail@gmail.com
export MAIL_APP_PASSWORD=sua_app_password_google
export MAIL_FROM=seuemail@gmail.com
```

4. Inicie o backend:

```bash
cd /Users/antonymichael/Squad-19/gestao-contratos
./mvnw spring-boot:run
```

### Opcao avancada: Gmail API OAuth2

```bash
export MAIL_PROVIDER=gmail-api
export MAIL_FROM=seuemail@gmail.com
export GMAIL_API_ACCESS_TOKEN=seu_access_token_oauth2
```

### Como validar rapidamente

1. Faça login no sistema.
2. Crie uma reuniao na Agenda.
3. O backend tentara enviar e-mail para:
- email de contato da empresa
- e-mails dos participantes da reuniao

Se quiser testar com o usuario seed:
- admin@climbe.com
- PrimeiroAcesso@123

