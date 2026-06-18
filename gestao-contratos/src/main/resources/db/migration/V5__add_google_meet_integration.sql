ALTER TABLE integracoes_usuario
    ADD COLUMN google_meet TINYINT(1) NOT NULL DEFAULT 0 AFTER google_calendar;

ALTER TABLE integracoes_usuario
    ADD CONSTRAINT chk_integ_gmeet CHECK (google_meet IN (0, 1));
