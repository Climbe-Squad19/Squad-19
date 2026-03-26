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

    private String pauta;

    @ManyToOne
    private Empresa empresa;

    @ManyToOne
    private Contrato contrato;    

    private LocalDateTime dataHora;
    private boolean presencial;
    private String linkOnline;
    private String sala;

    @Enumerated(EnumType.STRING)
    private StatusReuniao status;     
    @ElementCollection
    @CollectionTable(
        name = "reuniao_participantes",
        joinColumns = @JoinColumn(name = "reuniao_id")
    )
    private List<Long> participantesIds; 

    @Column(updatable = false)
    private LocalDateTime dataCriacao; 

    public enum StatusReuniao {
        AGENDADA, CANCELADA, REALIZADA
    }
}