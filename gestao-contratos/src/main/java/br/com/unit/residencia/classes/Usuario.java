package br.com.unit.residencia.classes;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomeCompleto; 

    private String cargo; 

    @Column(unique = true, nullable = false)
    private String cpf; 

    @Column(unique = true, nullable = false)
    private String email; 

    private String contato; 

    private boolean ativo; 

    @ElementCollection
    private List<String> permissoes; // Caso tenha mais de uma permissão
}