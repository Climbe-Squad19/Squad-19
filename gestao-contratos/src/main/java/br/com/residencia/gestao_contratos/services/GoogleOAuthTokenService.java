package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import br.com.residencia.gestao_contratos.classes.IntegracaoOAuthToken;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.repository.IntegracaoOAuthTokenRepository;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Service
public class GoogleOAuthTokenService {

    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

    private final IntegracaoOAuthTokenRepository integracaoOAuthTokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final WebClient webClient;
    private final String googleClientId;
    private final String googleClientSecret;

    private final TokenEncryptionService tokenEncryptionService;

    public GoogleOAuthTokenService(
            IntegracaoOAuthTokenRepository integracaoOAuthTokenRepository,
            UsuarioRepository usuarioRepository,
            WebClient.Builder webClientBuilder,
            TokenEncryptionService tokenEncryptionService, // <- adicionado
            @Value("${app.integrations.google.client-id:}") String googleClientId,
            @Value("${app.integrations.google.client-secret:}") String googleClientSecret) {
        this.integracaoOAuthTokenRepository = integracaoOAuthTokenRepository;
        this.usuarioRepository = usuarioRepository;
        this.webClient = webClientBuilder.build();
        this.tokenEncryptionService = tokenEncryptionService; // <- adicionado
        this.googleClientId = googleClientId;
        this.googleClientSecret = googleClientSecret;
    }

    @Transactional
    public Optional<String> getValidAccessTokenForUserEmail(
            String email,
            IntegracaoOAuthToken.ProvedorIntegracao provedor) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null) {
            return Optional.empty();
        }

        IntegracaoOAuthToken token = integracaoOAuthTokenRepository
                .findByUsuarioAndProvedor(usuario, provedor)
                .orElse(null);
        if (token == null) {
            return Optional.empty();
        }

        String accessTokenPlain   = tokenEncryptionService.decrypt(token.getAccessToken());
        String refreshTokenPlain  = token.getRefreshToken() != null
                ? tokenEncryptionService.decrypt(token.getRefreshToken())
                : null;

        boolean expirado = token.getExpiresAt() != null
                && token.getExpiresAt().isBefore(LocalDateTime.now().plusMinutes(1));

        if (expirado) {
            if (refreshTokenPlain == null || refreshTokenPlain.isBlank()
                    || googleClientId == null || googleClientId.isBlank()
                    || googleClientSecret == null || googleClientSecret.isBlank()) {
                return Optional.empty();
            }

            Map<String, Object> refreshed = webClient.post()
                    .uri(GOOGLE_TOKEN_URL)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData("client_id", googleClientId)
                            .with("client_secret", googleClientSecret)
                            .with("grant_type", "refresh_token")
                            .with("refresh_token", refreshTokenPlain)) // <- texto puro na chamada HTTP
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (refreshed == null || refreshed.get("access_token") == null) {
                return Optional.empty();
            }

            String novoAccessTokenPlain = String.valueOf(refreshed.get("access_token"));
            Integer expiresIn = refreshed.get("expires_in") instanceof Number
                    ? ((Number) refreshed.get("expires_in")).intValue()
                    : null;

            token.setAccessToken(tokenEncryptionService.encrypt(novoAccessTokenPlain));
            token.setExpiresAt(expiresIn != null
                    ? LocalDateTime.now().plusSeconds(expiresIn)
                    : null);
            if (refreshed.get("scope") != null) {
                token.setScope(String.valueOf(refreshed.get("scope")));
            }
            if (refreshed.get("token_type") != null) {
                token.setTokenType(String.valueOf(refreshed.get("token_type")));
            }
            integracaoOAuthTokenRepository.save(token);

            return Optional.of(novoAccessTokenPlain);
        }

        return Optional.ofNullable(accessTokenPlain);
    }
}