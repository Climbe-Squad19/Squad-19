package br.com.unit.residencia.classes
;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "propostas")
public class Proposta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Empresa empresa;

    private String servicoContratado; // Ex: Valuation, BPO, M&A
    private BigDecimal valorMensal;
    private BigDecimal valorSetup;
    private LocalDate dataEmissao;
    private String linkGoogleDrive; // Integração com Drive

    @Enumerated(EnumType.STRING)
    private StatusProposta status;

    public enum StatusProposta {
        ELABORACAO, ENVIADA, ACEITA, RECUSADA
    }
}