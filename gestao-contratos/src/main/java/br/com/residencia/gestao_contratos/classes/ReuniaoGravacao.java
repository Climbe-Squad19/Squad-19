package br.com.residencia.gestao_contratos.classes;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "reuniao_gravacoes")
public class ReuniaoGravacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reuniao_id", nullable = false)
    private Reuniao reuniao;

    @Column(name = "meeting_code", length = 32)
    private String meetingCode;

    @Column(name = "recording_name", nullable = false, length = 255)
    private String recordingName;

    @Column(length = 64)
    private String estado;

    @Column(name = "drive_file", length = 512)
    private String driveFile;

    @Column(length = 1024)
    private String url;

    @Column(name = "ultima_sincronizacao", nullable = false)
    private LocalDateTime ultimaSincronizacao;
}
