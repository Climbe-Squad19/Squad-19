CREATE TABLE reuniao_gravacoes (
    id BIGINT NOT NULL AUTO_INCREMENT,
    reuniao_id BIGINT NOT NULL,
    meeting_code VARCHAR(32),
    recording_name VARCHAR(255) NOT NULL,
    estado VARCHAR(64),
    drive_file VARCHAR(512),
    url VARCHAR(1024),
    ultima_sincronizacao DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_reuniao_gravacoes_reuniao FOREIGN KEY (reuniao_id) REFERENCES reunioes (id)
        ON DELETE CASCADE
        ON UPDATE RESTRICT,
    UNIQUE KEY uk_reuniao_gravacoes_recording_name (recording_name),
    KEY idx_reuniao_gravacoes_reuniao (reuniao_id),
    KEY idx_reuniao_gravacoes_sync (ultima_sincronizacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
