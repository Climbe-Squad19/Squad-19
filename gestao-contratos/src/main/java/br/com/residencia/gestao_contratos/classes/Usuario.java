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
    @Column(length = 255)
    private Cargo cargo;

    @Column(unique = true, nullable = false, length = 14)
    private String cpf;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(length = 50)
    private String telefone;

    private boolean ativo;

    private String senha;

    @Column(length = 512)
    private String fotoPerfilUrl;

    @Column(length = 255)
    private String googleId;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
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