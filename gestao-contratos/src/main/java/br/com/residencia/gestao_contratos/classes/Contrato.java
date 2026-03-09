package br.com.residencia.gestao_contratos.classes;


import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "contratos")
public class Contrato {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Proposta propostaOrigem;

    @ManyToOne
    private Empresa empresa;

    private LocalDate dataInicio;
    private LocalDate dataFim;
    private String linkContratoAssinado; // PDF no Google Drive
    
    private boolean renovacaoAutomatica;
    private String observacoes;
}