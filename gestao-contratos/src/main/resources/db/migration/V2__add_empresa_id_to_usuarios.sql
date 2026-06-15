-- Adiciona coluna empresa_id na tabela usuarios para permitir que /auth/me retorne empresaId.
ALTER TABLE usuarios
    ADD COLUMN empresa_id BIGINT;
