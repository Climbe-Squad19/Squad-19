package br.com.residencia.gestao_contratos.classes;

import java.math.BigDecimal;
import java.time.LocalDate;
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
@Table(name = "propostas")
public class Proposta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Empresa empresa;

    @ManyToOne
    private Usuario criadoPor;          

    private String servicoContratado;
    private BigDecimal valorMensal;
    private BigDecimal valorSetup;
    private LocalDate dataEmissao;
    private String linkGoogleDrive;
    private String motivoRecusa;        

    @Enumerated(EnumType.STRING)
    private StatusProposta status;

    @Column(updatable = false)
    private LocalDateTime dataCriacao;   

    public enum StatusProposta {
        ELABORACAO, ENVIADA, ACEITA, RECUSADA
    }
}