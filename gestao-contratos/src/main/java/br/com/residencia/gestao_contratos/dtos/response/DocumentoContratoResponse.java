package br.com.residencia.gestao_contratos.dtos.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DocumentoContratoResponse {
    private Long id;
    private Long contratoId;
    private Long enviadoPorId;
    private String nomeEnviadoPor;
    private String nomeArquivo;
    private String tipoArquivo;
    private Long tamanhoBytes;
    private String s3Url;
    private String googleDriveWebViewLink;
    private LocalDateTime dataUpload;
}
