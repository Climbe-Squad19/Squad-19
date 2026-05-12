# Fluxograma Funcional e Cobertura Front-end

Este documento consolida o fluxo funcional do sistema com foco nas telas do dashboard e nos botoes principais.

## 1. Autenticacao
- Entrada pelo login (e-mail/senha).
- Sessao ativa apos autenticacao valida.
- Acao de sair com confirmacao obrigatoria:
  - menu lateral -> Conta -> Sair
  - menu do perfil -> Sair
  - Configuracoes -> Seguranca -> Sair da conta

## 2. Registro de empresa e clientes
- Tela: Clientes / Empresas.
- Fluxos implementados:
  - botao `+ Nova Empresa` abre painel de criacao.
  - validacao de nome/documento/categoria.
  - botao `Abrir detalhes` por empresa.
  - abas internas: Visao geral, Propostas, Contratos, Documentos, Reunioes, Relatorios.
  - acoes por aba com botoes de acao (ver detalhes, abrir contrato, ver documento, ver reuniao, baixar relatorio).

## 3. Gerenciamento de proposta comercial
- Tela: Propostas comerciais.
- Fluxos implementados:
  - botao `+ Nova proposta` abre modal de criacao.
  - validacao de empresa e valor.
  - proposta criada entra na coluna `Rascunhos`.
  - botao `Ver detalhes` por card de proposta abre modal com etapa, servico e valor.

## 4. Configuracoes
- Tela: Configuracoes com abas:
  - Meu Perfil
  - Seguranca
  - Notificacoes
  - Integracoes
- Fluxos implementados:
  - Meu Perfil: edicao de nome, telefone e e-mail + salvar.
  - Seguranca: troca de senha com validacoes + saida da conta.
  - Notificacoes: toggles para sistema, e-mail e alertas.
  - Integracoes: estado conectado/conectar para Google Drive, Calendar, Sheets e Gmail.

## 5. Agenda e reunioes
- Tela: Agenda semanal/mensal.
- Fluxos implementados:
  - botao `+ Novo evento`.
  - criacao de reuniao presencial/online.
  - sincronizacao visual da agenda apos salvar.

## 6. Estado atual da validacao tecnica
- Back-end: `./mvnw clean test` executado com sucesso (BUILD SUCCESS).
- Front-end: `npm run build` executado com sucesso.

## 7. Observacoes para evolucao
- Parte das telas usa dados mockados para experiencia de navegacao.
- Proximo passo natural: conectar botoes e modais aos endpoints definitivos de proposta/empresa/relatorio.
