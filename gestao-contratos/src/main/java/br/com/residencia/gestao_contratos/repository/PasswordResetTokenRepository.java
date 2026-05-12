package br.com.residencia.gestao_contratos.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.residencia.gestao_contratos.classes.PasswordResetToken;
import br.com.residencia.gestao_contratos.classes.Usuario;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    Optional<PasswordResetToken> findByTokenAndUsadoFalse(String token);

    List<PasswordResetToken> findByUsuarioAndUsadoFalse(Usuario usuario);

    void deleteByExpiracaoBefore(LocalDateTime data);
}
