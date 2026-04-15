-- Flyway V1 — conteúdo espelha o CANÔNICO /climbe_db.sql na raiz do repositório.
-- Não editar só aqui: altere climbe_db.sql primeiro, depois copie para este arquivo.

-- ============================================================
-- CANÔNICO: climbe_db.sql — este arquivo é a fonte da verdade do schema.
-- Deploy via app: mesma definição em
--   gestao-contratos/src/main/resources/db/migration/V1__climbe_schema.sql
-- Alterações futuras: melhorar aqui primeiro, depois espelhar no V1 (ou novo V2__).
--
-- Segurança (operacional — fora deste script):
--   • Conexão TLS: useSSL=true em produção e certificados confiáveis.
--   • Não use usuário root na aplicação; crie um usuário só com DML no schema climbe.
--   • sql_mode recomendado: STRICT_TRANS_TABLES, ERROR_FOR_DIVISION_BY_ZERO, NO_ENGINE_SUBSTITUTION
--   • Senhas e tokens OAuth são responsabilidade da aplicação (hash bcrypt, rotação, etc.).
--
-- Import manual:
--   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS climbe CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
--   mysql -u root -p climbe < climbe_db.sql
--
-- Usuário dedicado (exemplo — ajuste host e senha):
--   CREATE USER 'climbe_app'@'%' IDENTIFIED BY 'senha_forte_aleatoria';
--   GRANT SELECT, INSERT, UPDATE, DELETE ON climbe.* TO 'climbe_app'@'%';
--   FLUSH PRIVILEGES;
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE usuarios (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome_completo VARCHAR(255) NOT NULL COMMENT 'Nome exibido; não é dado secreto',
    cargo VARCHAR(255) COMMENT 'Enum Cargo em string',
    cpf VARCHAR(14) NOT NULL COMMENT 'Documento; unicidade no app',
    email VARCHAR(255) NOT NULL COMMENT 'Login; normalizar lowercase na aplicação',
    telefone VARCHAR(50),
    ativo TINYINT(1) NOT NULL,
    senha VARCHAR(255) NULL COMMENT 'Hash bcrypt (~60 chars); nunca texto puro',
    foto_perfil_url VARCHAR(512),
    google_id VARCHAR(255),
    situacao VARCHAR(32),
    data_criacao DATETIME(6) NULL COMMENT 'Preenchido na criação; imutável na API',
    PRIMARY KEY (id),
    UNIQUE KEY uk_usuarios_cpf (cpf),
    UNIQUE KEY uk_usuarios_email (email),
    CONSTRAINT chk_usuarios_ativo CHECK (ativo IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Contas de acesso; proteger linhas com regras de negócio na API';

CREATE TABLE usuario_permissoes (
    usuario_id BIGINT NOT NULL,
    permissoes VARCHAR(64) NOT NULL,
    CONSTRAINT fk_usuario_permissoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Cargos adicionais; escopo mínimo na aplicação';

CREATE INDEX idx_usuario_permissoes_usuario ON usuario_permissoes (usuario_id);

CREATE TABLE empresas (
    id BIGINT NOT NULL AUTO_INCREMENT,
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18) NOT NULL,
    logradouro VARCHAR(255),
    numero VARCHAR(32),
    bairro VARCHAR(128),
    cidade VARCHAR(128),
    uf CHAR(2),
    cep VARCHAR(16),
    telefone VARCHAR(50),
    email_contato VARCHAR(255),
    nome_representante VARCHAR(255),
    cpf_representante VARCHAR(14),
    contato_representante VARCHAR(50),
    ativa TINYINT(1) NOT NULL,
    data_cadastro DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_empresas_cnpj (cnpj),
    CONSTRAINT chk_empresas_ativa CHECK (ativa IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE propostas (
    id BIGINT NOT NULL AUTO_INCREMENT,
    empresa_id BIGINT,
    criado_por_id BIGINT,
    servico_contratado VARCHAR(255),
    valor_mensal DECIMAL(19, 2),
    valor_setup DECIMAL(19, 2),
    data_emissao DATE,
    link_google_drive VARCHAR(512),
    motivo_recusa TEXT,
    status VARCHAR(32),
    data_criacao DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_propostas_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_propostas_criado_por FOREIGN KEY (criado_por_id) REFERENCES usuarios (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contratos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    proposta_origem_id BIGINT,
    empresa_id BIGINT,
    usuario_responsavel_id BIGINT,
    tipo_servico VARCHAR(255),
    status VARCHAR(32),
    data_inicio DATE,
    data_fim DATE,
    dias_aviso_vencimento INT,
    link_contrato_assinado VARCHAR(512),
    renovacao_automatica TINYINT(1) NOT NULL,
    observacoes TEXT,
    data_criacao DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_contratos_proposta_origem (proposta_origem_id),
    CONSTRAINT fk_contratos_proposta FOREIGN KEY (proposta_origem_id) REFERENCES propostas (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_contratos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_contratos_usuario_resp FOREIGN KEY (usuario_responsavel_id) REFERENCES usuarios (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_contratos_renovacao CHECK (renovacao_automatica IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reunioes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    pauta VARCHAR(512),
    empresa_id BIGINT,
    contrato_id BIGINT,
    tipo VARCHAR(32),
    data_hora DATETIME(6),
    presencial TINYINT(1) NOT NULL,
    link_online VARCHAR(512),
    sala VARCHAR(128),
    status VARCHAR(32),
    data_criacao DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_reunioes_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_reunioes_contrato FOREIGN KEY (contrato_id) REFERENCES contratos (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT chk_reunioes_presencial CHECK (presencial IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reuniao_participantes (
    reuniao_id BIGINT NOT NULL,
    participantes_ids BIGINT NOT NULL,
    CONSTRAINT fk_reuniao_part_reuniao FOREIGN KEY (reuniao_id) REFERENCES reunioes (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reuniao_part_reuniao ON reuniao_participantes (reuniao_id);

CREATE TABLE documentos_empresa (
    id BIGINT NOT NULL AUTO_INCREMENT,
    empresa_id BIGINT,
    validado_por_id BIGINT,
    tipo VARCHAR(64),
    status VARCHAR(32),
    nome_arquivo VARCHAR(512),
    tipo_arquivo VARCHAR(128),
    tamanho_bytes BIGINT,
    conteudo LONGBLOB COMMENT 'Opcional se arquivo só no object storage',
    s3_key VARCHAR(512) COMMENT 'Chave no bucket; não expor em logs',
    s3_url VARCHAR(1024),
    google_drive_file_id VARCHAR(255),
    google_drive_web_view_link VARCHAR(1024),
    motivo_rejeicao TEXT,
    data_upload DATETIME(6) NULL,
    data_validacao DATETIME(6) NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_doc_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_doc_validado_por FOREIGN KEY (validado_por_id) REFERENCES usuarios (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Metadados; binário pode ser vazio se S3/Supabase';

CREATE TABLE integracoes_usuario (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    google_drive TINYINT(1) NOT NULL,
    google_calendar TINYINT(1) NOT NULL,
    google_sheets TINYINT(1) NOT NULL,
    gmail TINYINT(1) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_integracoes_usuario (usuario_id),
    CONSTRAINT fk_integracoes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT chk_integ_gdrive CHECK (google_drive IN (0, 1)),
    CONSTRAINT chk_integ_gcal CHECK (google_calendar IN (0, 1)),
    CONSTRAINT chk_integ_gsheets CHECK (google_sheets IN (0, 1)),
    CONSTRAINT chk_integ_gmail CHECK (gmail IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE integracoes_oauth_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    provedor VARCHAR(32) NOT NULL,
    access_token VARCHAR(3000) NOT NULL COMMENT 'Secreto; rotação e escopo mínimo na API Google',
    refresh_token VARCHAR(3000) NULL,
    token_type VARCHAR(32),
    scope VARCHAR(2048),
    expires_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_oauth_usuario_provedor (usuario_id, provedor),
    CONSTRAINT fk_oauth_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    KEY idx_oauth_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tokens OAuth; tratar como credencial em repouso e trânsito';

CREATE TABLE password_reset_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL COMMENT 'Valor opaco de uso único; alta entropia na app',
    usuario_id BIGINT NOT NULL,
    expiracao DATETIME(6) NOT NULL,
    usado TINYINT(1) NOT NULL,
    data_criacao DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_password_reset_token (token),
    CONSTRAINT fk_password_reset_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    CONSTRAINT chk_password_reset_usado CHECK (usado IN (0, 1)),
    KEY idx_password_reset_expiracao (expiracao),
    KEY idx_password_reset_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Recuperação de senha; invalidar após uso ou expiração';

SET FOREIGN_KEY_CHECKS = 1;
