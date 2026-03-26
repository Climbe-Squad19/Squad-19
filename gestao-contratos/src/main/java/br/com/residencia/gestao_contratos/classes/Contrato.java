package br.com.residencia.gestao_contratos.classes;

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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

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

    @ManyToOne
    private Usuario usuarioResponsavel;  

    private String tipoServico;         

    @Enumerated(EnumType.STRING)
    private StatusContrato status;      

    private LocalDate dataInicio;
    private LocalDate dataFim;
    private Integer diasAvisoVencimento; 
    private String linkContratoAssinado;
    private boolean renovacaoAutomatica;
    private String observacoes;

    @Column(updatable = false)
    private LocalDateTime dataCriacao;   

    public enum StatusContrato {
        ATIVO, ENCERRADO, CANCELADO
    }
}