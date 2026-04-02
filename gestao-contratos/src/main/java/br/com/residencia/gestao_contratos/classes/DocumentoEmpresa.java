package br.com.residencia.gestao_contratos.classes;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
    private TipoDocumento tipo;         

    @Enumerated(EnumType.STRING)
    private StatusDocumento status;

    private String nomeArquivo;
    private String tipoArquivo;         
    private Long tamanhoBytes;

    @Column(columnDefinition = "LONGBLOB")
    private byte[] conteudo;           

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