package br.com.residencia.gestao_contratos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.IntegracaoOAuthToken;
import br.com.residencia.gestao_contratos.classes.Usuario;

@Repository
public interface IntegracaoOAuthTokenRepository extends JpaRepository<IntegracaoOAuthToken, Long> {
    Optional<IntegracaoOAuthToken> findByUsuarioAndProvedor(
            Usuario usuario,
            IntegracaoOAuthToken.ProvedorIntegracao provedor);
}
