package br.com.residencia.gestao_contratos.classes;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

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

    private LocalDateTime dataHora; 
    
    private boolean presencial; // Checkbox pra decidir se é presencial ou online
    
    private String linkOnline; // caso seja online
    private String sala; // caso seja presencial
}