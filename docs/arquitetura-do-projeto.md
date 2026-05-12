# Arquitetura Do Projeto

Este documento mostra a arquitetura completa do sistema Climbe, cobrindo frontend, backend, segurança, persistência e integrações.

## Visão Geral

```mermaid
flowchart LR
    U[Usuario]

    subgraph FE[Frontend - React + Vite + TypeScript]
        UI[Pages e Componentes UI\nDashboard, Login, Drawer, Modais]
        STATE[Redux Toolkit\nUI state e profile state]
        FORM[React Hook Form + Zod\nvalidacao e formularios]
        API[Services HTTP\ndashboard.ts]
    end

    subgraph BE[Backend - Spring Boot]
        CTRL[Controllers\nAuthController\nDashboardController\nReuniaoController\nEmpresaController\nPropostaController\nContratoController\nUsuarioController\nDocumentoEmpresaController]
        SEC[Seguranca JWT\nSecurityConfig\nJwtAuthFilter\nJwtService\nUserDetailsServiceImpl]
        SERV[Services\nReuniaoService\nDashboardService\nPropostaService\nContratoService\nUsuarioService\nDocumentoEmpresaService\nApiIntegrationService]
        REPO[Repositories\nJPA Repositories]
        DTO[DTOs Request/Response]
        ENT[Entidades\nUsuario\nEmpresa\nProposta\nContrato\nReuniao\nDocumentoEmpresa]
    end

    subgraph DATA[Persistencia]
        H2[(H2\nambiente local)]
        MYSQL[(MySQL\nambiente alternativo/producao)]
    end

    subgraph EXT[Integracoes Externas]
        SWAGGER[Swagger / OpenAPI]
        GDRIVE[Google Drive]
        GCAL[Google Calendar]
        GMAIL[Gmail / notificacoes]
        EXTAPI[API externa via WebClient]
    end

    U --> UI
    UI --> STATE
    UI --> FORM
    UI --> API
    API --> CTRL

    CTRL --> SEC
    CTRL --> SERV
    CTRL --> DTO
    SERV --> REPO
    REPO --> ENT
    REPO --> H2
    REPO --> MYSQL

    SERV --> GDRIVE
    SERV --> GCAL
    SERV --> GMAIL
    SERV --> EXTAPI
    CTRL --> SWAGGER
```

## Camadas

### 1. Frontend
- Baseado em React com Vite e TypeScript.
- A tela principal de operação está centralizada em Dashboard.
- O estado global é controlado com Redux Toolkit.
- Formulários usam React Hook Form e Zod.
- As chamadas para backend ficam concentradas em services.

### 2. Backend
- Construído em Spring Boot 3.
- Controllers expõem endpoints REST.
- Services concentram regras de negócio.
- Repositories usam Spring Data JPA.
- DTOs isolam contratos de entrada e saída.
- A camada Security usa JWT para autenticação.

### 3. Segurança
- Login ocorre via AuthController.
- O token JWT é validado por JwtAuthFilter.
- UserDetailsServiceImpl carrega o usuário autenticado.
- SecurityConfig define quais rotas são públicas e quais exigem autenticação.

### 4. Persistência
- O ambiente local está configurado com H2 em memória.
- O projeto também possui dependência para MySQL.
- As entidades principais representam usuários, empresas, propostas, contratos, reuniões e documentos.

### 5. Integrações
- Swagger/OpenAPI documenta e testa os endpoints.
- O frontend já prevê fluxos de integração com Google Drive, Google Calendar e Gmail.
- Existe também uma integração externa via ApiIntegrationService.

## Fluxo Principal

```mermaid
sequenceDiagram
    participant User as Usuario
    participant Front as Frontend
    participant Auth as AuthController
    participant Sec as JWT Security
    participant Service as Services
    participant Repo as Repositories
    participant DB as Banco

    User->>Front: Interage com Login / Dashboard
    Front->>Auth: POST /auth/login
    Auth-->>Front: accessToken JWT
    Front->>Sec: Envia requisicoes com token
    Sec->>Service: Requisicao autenticada
    Service->>Repo: Consulta ou grava dados
    Repo->>DB: Operacao JPA
    DB-->>Repo: Resultado
    Repo-->>Service: Entidades
    Service-->>Front: DTOs de resposta
    Front-->>User: Atualiza a interface
```

## Fluxos Funcionais Mais Importantes

### Agenda e calendario
- Front chama endpoints de dashboard e reuniões.
- Backend consolida os eventos via DashboardService e ReuniaoService.
- O frontend renderiza agenda semanal, mensal e notificações de evento.

### Propostas comerciais
- Front cria e lista propostas.
- Backend valida permissões do usuário autenticado.
- Propostas aceitas podem originar contratos.

### Clientes / empresas
- Front lista empresas e abre detalhes por abas.
- Backend concentra dados de empresa, contratos, propostas, documentos e reuniões.

### Configurações e notificações
- Front controla preferências de perfil, segurança, notificações e integrações.
- Backend hoje já suporta base para autenticação e agenda.
- Disparo real de e-mail/notificação ainda pode ser evoluído como próximo passo.

## Estrutura Resumida

```text
Squad-19/
├── frontend/
│   ├── src/pages/
│   ├── src/components/
│   ├── src/store/
│   ├── src/services/
│   └── src/styles.css
├── gestao-contratos/
│   ├── src/main/java/.../controller/
│   ├── src/main/java/.../services/
│   ├── src/main/java/.../repository/
│   ├── src/main/java/.../Security/
│   ├── src/main/java/.../classes/
│   └── src/main/resources/application.properties
└── docs/
    └── arquitetura-do-projeto.md
```

## Observações
- O frontend e o backend estão separados, mas funcionam como uma aplicação web integrada.
- A arquitetura atual está organizada em camadas clássicas, o que facilita evolução e manutenção.
- O próximo passo natural de arquitetura seria consolidar notificações reais por e-mail e sincronizações externas no backend.