package br.com.residencia.gestao_contratos.classes;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

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

    private String senha;

    @ElementCollection
    private List<String> permissoes; // Caso tenha mais de uma permissão
}