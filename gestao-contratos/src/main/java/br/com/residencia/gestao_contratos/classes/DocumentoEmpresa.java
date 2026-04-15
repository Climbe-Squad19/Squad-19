package br.com.residencia.gestao_contratos.classes;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "documentos_empresa")
public class DocumentoEmpresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Empresa empresa;

    @ManyToOne
    private Usuario validadoPor;        

    @Enumerated(EnumType.STRING)
    @Column(length = 64)
    private TipoDocumento tipo;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private StatusDocumento status;

    @Column(length = 512)
    private String nomeArquivo;
    @Column(length = 128)
    private String tipoArquivo;
    private Long tamanhoBytes;

    @Lob
    private byte[] conteudo;

    @Column(length = 512)
    private String s3Key;
    @Column(length = 1024)
    private String s3Url;

    @Column(length = 255)
    private String googleDriveFileId;
    @Column(length = 1024)
    private String googleDriveWebViewLink;

    private String motivoRejeicao;      

    @Column(updatable = false)
    private LocalDateTime dataUpload;

    private LocalDateTime dataValidacao;

    public enum TipoDocumento {
        BALANCO_EMPRESA,                
        DRE,                           
        PLANILHA_GERENCIAL,             
        CNPJ,                          
        CONTRATO_SOCIAL                 
    }

    public enum StatusDocumento {
        PENDENTE,                      
        APROVADO,                      
        REJEITADO                       
    }
}