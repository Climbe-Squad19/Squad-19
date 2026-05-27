-- V3 — Tabela de documentos (PDF) vinculados a contratos
-- Upload suporta armazenamento local (LONGBLOB), S3 ou Google Drive.

CREATE TABLE documentos_contrato (
    id                         BIGINT       NOT NULL AUTO_INCREMENT,
    contrato_id                BIGINT       NOT NULL,
    enviado_por_id             BIGINT,
    nome_arquivo               VARCHAR(500) NOT NULL,
    tipo_arquivo               VARCHAR(255),
    tamanho_bytes              BIGINT,
    data_upload                DATETIME(6),
    conteudo                   LONGBLOB,
    s3_key                     VARCHAR(500),
    s3_url                     VARCHAR(1000),
    google_drive_file_id       VARCHAR(500),
    google_drive_web_view_link VARCHAR(1000),
    PRIMARY KEY (id),
    CONSTRAINT fk_doc_contrato FOREIGN KEY (contrato_id)    REFERENCES contratos (id) ON DELETE CASCADE,
    CONSTRAINT fk_doc_usuario  FOREIGN KEY (enviado_por_id) REFERENCES usuarios  (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Documentos PDF anexados a contratos; conteudo nulo quando armazenado em S3 ou Drive';

CREATE INDEX idx_documentos_contrato_contrato ON documentos_contrato (contrato_id);
