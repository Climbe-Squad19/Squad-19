package br.com.residencia.gestao_contratos.classes;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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

    @Enumerated(EnumType.STRING)
    private Cargo cargo;                // cargo principal

    @Column(unique = true, nullable = false)
    private String cpf;

    @Column(unique = true, nullable = false)
    private String email;

    private String telefone;

    private boolean ativo;

    private String senha;

    private String fotoPerfilUrl;       // Autenticação

    private String googleId;            // Autenticação

    @Enumerated(EnumType.STRING)
    private SituacaoUsuario situacao;   

    @Column(updatable = false)
    private LocalDateTime dataCriacao;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "usuario_permissoes",
        joinColumns = @JoinColumn(name = "usuario_id")
    )
    @Enumerated(EnumType.STRING)
    private List<Cargo> permissoes;     

    public enum SituacaoUsuario {
        ATIVO, INATIVO, PENDENTE
    }
}