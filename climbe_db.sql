-- Criação das tabelas principais
CREATE TABLE cargos (
    id_cargo INT PRIMARY KEY AUTO_INCREMENT,
    nome_cargo VARCHAR(255) NOT NULL);

CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome_completo VARCHAR(255) NOT NULL,
    cargo_id INT,
    cpf CHAR(14) UNIQUE,
    email VARCHAR(255) UNIQUE,
    contato VARCHAR(50),
    situacao VARCHAR(255),
    senha_hash CHAR(60),
    FOREIGN KEY (cargo_id) REFERENCES cargos(id_cargo));

CREATE TABLE empresas (
    id_empresa INT PRIMARY KEY AUTO_INCREMENT,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj CHAR(18) UNIQUE,
    logradouro VARCHAR(255),
    numero VARCHAR(255),
    bairro VARCHAR(255),
    cidade VARCHAR(255),
    uf VARCHAR(255),
    cep VARCHAR(255),
    telefone VARCHAR(50),
    email VARCHAR(255),
    representante_nome VARCHAR(255),
    representante_cpf CHAR(14),
    representante_contato VARCHAR(50));

-- Tabelas de reuniões
CREATE TABLE reunioes (
    id_reuniao INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255) NOT NULL,
    empresa_id INT,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    presencial BOOLEAN NOT NULL,
    local VARCHAR(255) NOT NULL,
    pauta TEXT NOT NULL,
    status VARCHAR(255) NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id_empresa));

CREATE TABLE propostas (
    id_proposta INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT,
    usuario_id INT,
    status VARCHAR(255) NOT NULL,
    data_criacao DATE NOT NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id_empresa),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario));

CREATE TABLE contratos (
    id_contrato INT PRIMARY KEY AUTO_INCREMENT,
    proposta_id INT UNIQUE, -- Relacionamento 1:1 com proposta
    data_inicio DATE,
    data_fim DATE,
    status VARCHAR(255),
    FOREIGN KEY (proposta_id) REFERENCES propostas(id_proposta));

-- Tabelas notificações:
CREATE TABLE notificacoes (
    id_notificacao INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    mensagem VARCHAR(255) NOT NULL,
    data_envio DATE NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario));

-- Tabelas Participantes Reunião
CREATE TABLE participantes_reuniao (
    id_reuniao INT,
    id_usuario INT,
    PRIMARY KEY (id_reuniao, id_usuario),
    FOREIGN KEY (id_reuniao) REFERENCES reunioes(id_reuniao),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario));

-- Tabelas de planilhas
CREATE TABLE planilhas (
    id_planilhas INT PRIMARY KEY AUTO_INCREMENT,
    contrato_id INT NOT NULL,
    url_google_sheets VARCHAR(255) NOT NULL,
    bloqueada BOOLEAN NOT NULL,
    permissao_visualizacao VARCHAR(255) NOT NULL,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id_contrato));

-- Tabelas de relatórios
CREATE TABLE relatorios (
    id_relatorio INT PRIMARY KEY AUTO_INCREMENT,
    contrato_id INT NOT NULL,
    url_pdf VARCHAR(255) NOT NULL,
    data_envio DATE NOT NULL,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id_contrato));

-- Tabelas de apoio e N:N
CREATE TABLE servicos (
    id_servico INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL);

CREATE TABLE empresa_servico (
    id_empresa INT,
    id_servico INT,
    FOREIGN KEY (id_empresa) REFERENCES empresas(id_empresa),
    FOREIGN KEY (id_servico) REFERENCES servicos(id_servico));

-- Tabela de documentos (vinculada à empresa e à proposta)
CREATE TABLE documentos (
    id_documento INT PRIMARY KEY AUTO_INCREMENT,
    empresa_id INT,
    proposta_id INT,
    tipo_documento VARCHAR(255),
    url VARCHAR(255),
    validado VARCHAR(255),
    analista_id INT,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id_empresa),
    FOREIGN KEY (proposta_id) REFERENCES propostas(id_proposta),
    FOREIGN KEY (analista_id) REFERENCES usuarios(id_usuario));

-- Tabelas de permissões
CREATE TABLE permissoes (
    id_permissao INT PRIMARY KEY AUTO_INCREMENT,
    descricao VARCHAR(255) NOT NULL);

-- Tabela de usuários e permissões
CREATE TABLE usuario_permissao (
    id_usuario INT,
    id_permissao INT,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_permissao) REFERENCES permissoes(id_permissao));

-- Tabela de tokens OAuth 2.0 (autenticação via Google)
CREATE TABLE oauth_tokens (
    id_token INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL UNIQUE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expira_em DATETIME NOT NULL,
    provedor VARCHAR(50) NOT NULL DEFAULT 'google',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario));

-- Tabela de sessões (controle JWT)
CREATE TABLE sessoes (
    id_sessao INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    token TEXT NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_em DATETIME NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario));
