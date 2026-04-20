package br.com.residencia.gestao_contratos.classes;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "reunioes")
public class Reuniao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 512)
    private String pauta;

    @ManyToOne
    private Empresa empresa;

    @ManyToOne
    private Contrato contrato;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private TipoReuniao tipo;

    private LocalDateTime dataHora;
    private boolean presencial;
    @Column(length = 512)
    private String linkOnline;
    @Column(length = 128)
    private String sala;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private StatusReuniao status;

    @ElementCollection
    @CollectionTable(
        name = "reuniao_participantes",
        joinColumns = @JoinColumn(name = "reuniao_id")
    )
    private List<Long> participantesIds;

    @Column(updatable = false)
    private LocalDateTime dataCriacao;

    public enum TipoReuniao {
        INICIAL,        
        APRESENTACAO    
    }

    public enum StatusReuniao {
        AGENDADA, CANCELADA, REALIZADA
    }
}