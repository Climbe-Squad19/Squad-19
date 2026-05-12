-- Notificações in-app para administradores (ex.: cadastro Google pendente)
CREATE TABLE IF NOT EXISTS notificacoes_internas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    mensagem VARCHAR(1024) NOT NULL,
    lida TINYINT(1) NOT NULL DEFAULT 0,
    criada_em DATETIME NOT NULL,
    INDEX idx_notif_internas_usuario (usuario_id),
    CONSTRAINT fk_notif_internas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
