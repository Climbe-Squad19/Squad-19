package br.com.residencia.gestao_contratos.classes;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
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
@Table(name = "integracoes_oauth_tokens")
public class IntegracaoOAuthToken {

    public enum ProvedorIntegracao {
        GOOGLEDRIVE,
        GOOGLECALENDAR,
        GOOGLESHEETS,
        GMAIL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ProvedorIntegracao provedor;

    @Column(nullable = false, length = 3000)
    private String accessToken;

    @Column(length = 3000)
    private String refreshToken;

    @Column(length = 32)
    private String tokenType;

    @Column(length = 2048)
    private String scope;
    private LocalDateTime expiresAt;
}
