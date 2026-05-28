package br.com.residencia.gestao_contratos.classes;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "documentos_contrato")
public class DocumentoContrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrato_id", nullable = false)
    private Contrato contrato;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enviado_por_id")
    private Usuario enviadoPor;

    @Column(name = "nome_arquivo", nullable = false, length = 500)
    private String nomeArquivo;

    @Column(name = "tipo_arquivo", length = 255)
    private String tipoArquivo;

    @Column(name = "tamanho_bytes")
    private Long tamanhoBytes;

    @Column(name = "data_upload")
    private LocalDateTime dataUpload;

    @Lob
    @Column(name = "conteudo", columnDefinition = "LONGBLOB")
    private byte[] conteudo;

    @Column(name = "s3_key", length = 500)
    private String s3Key;

    @Column(name = "s3_url", length = 1000)
    private String s3Url;

    @Column(name = "google_drive_file_id", length = 500)
    private String googleDriveFileId;

    @Column(name = "google_drive_web_view_link", length = 1000)
    private String googleDriveWebViewLink;
}
