package br.com.residencia.gestao_contratos.services;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import br.com.residencia.gestao_contratos.Security.JwtService;
import br.com.residencia.gestao_contratos.classes.Cargo;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

/**
 * Login OAuth2 com Google (Authorization Code + PKCE), conforme requisitos de segurança.
 * Callback dedicado: {@code /auth/google/callback} (registrar no Google Cloud junto ao de integrações).
 */
@Service
public class GoogleOAuthLoginService {

    private static final String GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
    private static final String USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo";
    private static final long STATE_TTL_MIN = 10;

    private final WebClient webClient;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final NotificacaoInternaService notificacaoInternaService;

    private final String clientId;
    private final String clientSecret;
    private final String loginRedirectUri;
    private final String frontendUrl;

    private final Map<String, PendingPkce> pendingByState = new ConcurrentHashMap<>();

    public GoogleOAuthLoginService(
            WebClient.Builder webClientBuilder,
            UsuarioRepository usuarioRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            NotificacaoInternaService notificacaoInternaService,
            @Value("${app.integrations.google.client-id:}") String clientId,
            @Value("${app.integrations.google.client-secret:}") String clientSecret,
            @Value("${app.integrations.google.login-redirect-uri:}") String loginRedirectUri,
            @Value("${app.frontend.url:http://localhost:5173}") String frontendUrl) {
        this.webClient = webClientBuilder.build();
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.notificacaoInternaService = notificacaoInternaService;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.loginRedirectUri = loginRedirectUri != null && !loginRedirectUri.isBlank()
                ? loginRedirectUri
                : "http://localhost:8081/auth/google/callback";
        this.frontendUrl = frontendUrl;
    }

    /** Indica se Client ID e Secret estão definidos (variáveis GOOGLE_* ou app.integrations.google.*). */
    public boolean isOAuthConfigured() {
        return clientId != null && !clientId.isBlank()
                && clientSecret != null && !clientSecret.isBlank();
    }

    public String buildAuthorizationRedirectUrl() {
        if (!isOAuthConfigured()) {
            throw new IllegalStateException(
                    "Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no ambiente da API e reinicie o servidor.");
        }
        String state = UUID.randomUUID().toString();
        byte[] random = new byte[32];
        new SecureRandom().nextBytes(random);
        String codeVerifier = Base64.getUrlEncoder().withoutPadding().encodeToString(random);
        pendingByState.put(state, new PendingPkce(codeVerifier, LocalDateTime.now()));

        String scope = "openid email profile";
        String challenge = pkceChallengeS256(codeVerifier);

        return GOOGLE_AUTH
                + "?client_id=" + enc(clientId)
                + "&redirect_uri=" + enc(loginRedirectUri)
                + "&response_type=code"
                + "&scope=" + enc(scope)
                + "&state=" + enc(state)
                + "&code_challenge=" + enc(challenge)
                + "&code_challenge_method=S256"
                + "&access_type=offline"
                + "&prompt=select_account";
    }

    @Transactional
    public String processCallback(String code, String state, String error) {
        if (error != null && !error.isBlank()) {
            return frontendUrl + "/?oauth_error=" + enc(error);
        }
        if (code == null || state == null || state.isBlank()) {
            return frontendUrl + "/?oauth_error=" + enc("missing_code_or_state");
        }

        PendingPkce pending = pendingByState.remove(state);
        if (pending == null || pending.criadoEm.plusMinutes(STATE_TTL_MIN).isBefore(LocalDateTime.now())) {
            return frontendUrl + "/?oauth_error=" + enc("invalid_or_expired_state");
        }

        Map<String, Object> tokenResponse;
try {
    tokenResponse = webClient.post()
            .uri(GOOGLE_TOKEN)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(BodyInserters.fromFormData("code", code)
                    .with("client_id", clientId)
                    .with("client_secret", clientSecret)
                    .with("redirect_uri", loginRedirectUri)
                    .with("grant_type", "authorization_code")
                    .with("code_verifier", pending.codeVerifier))
            .retrieve()
            .bodyToMono(Map.class)
            .block();
} catch (Exception e) {
    return frontendUrl + "/?oauth_error=" + enc("token_exchange_failed: " + e.getMessage());
}

if (tokenResponse == null || tokenResponse.get("access_token") == null) {
    return frontendUrl + "/?oauth_error=" + enc("token_exchange_failed");
}(tokenResponse == null || tokenResponse.get("access_token") == null) {
            return frontendUrl + "/?oauth_error=" + enc("token_exchange_failed");
        }

        String accessToken = String.valueOf(tokenResponse.get("access_token"));

        Map<String, Object> profile = webClient.get()
                .uri(USERINFO)
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (profile == null || profile.get("email") == null) {
            return frontendUrl + "/?oauth_error=" + enc("profile_email_missing");
        }

        String email = String.valueOf(profile.get("email")).trim().toLowerCase();
        String sub = profile.get("sub") != null ? String.valueOf(profile.get("sub")) : "";
        String nome = profile.get("name") != null ? String.valueOf(profile.get("name")) : email;
        String picture = profile.get("picture") != null ? String.valueOf(profile.get("picture")) : "";

        boolean emailVerified = Boolean.TRUE.equals(profile.get("email_verified"))
                || "true".equalsIgnoreCase(String.valueOf(profile.get("email_verified")));

        if (!emailVerified) {
            return frontendUrl + "/?oauth_error=" + enc("email_not_verified");
        }

        return usuarioRepository.findByEmailIgnoreCase(email)
                .map(u -> tratarUsuarioExistente(u, nome, picture, sub))
                .orElseGet(() -> criarNovoPendente(email, nome, picture, sub));
    }

    private String tratarUsuarioExistente(Usuario u, String nomeGoogle, String picture, String sub) {
        if (u.getSituacao() == Usuario.SituacaoUsuario.PENDENTE) {
            if (sub != null && !sub.isBlank()) {
                u.setGoogleId(sub);
            }
            if (picture != null && !picture.isBlank()) {
                u.setFotoPerfilUrl(picture);
            }
            usuarioRepository.save(u);
            return frontendUrl + "/?oauth_pending=1";
        }
        if (u.getSituacao() == Usuario.SituacaoUsuario.INATIVO || !u.isAtivo()) {
            return frontendUrl + "/?oauth_error=" + enc("account_inactive");
        }

        if (sub != null && !sub.isBlank()) {
            u.setGoogleId(sub);
        }
        if (picture != null && !picture.isBlank()) {
            u.setFotoPerfilUrl(picture);
        }
        usuarioRepository.save(u);

        String cargo = u.getCargo() != null ? u.getCargo().name() : "NENHUM";
        String jwt = jwtService.gerarToken(u.getEmail(), u.getId(), cargo);
        return frontendUrl + "/?climbe_token=" + enc(jwt);
    }

    private String criarNovoPendente(String email, String nome, String picture, String sub) {
        Usuario u = new Usuario();
        u.setNomeCompleto(nome);
        u.setEmail(email);
        u.setCpf(gerarCpfUnicoPlaceholder(sub, email));
        u.setTelefone("");
        u.setSenha(passwordEncoder.encode(UUID.randomUUID().toString()));
        u.setAtivo(false);
        u.setSituacao(Usuario.SituacaoUsuario.PENDENTE);
        u.setGoogleId(sub != null ? sub : "");
        u.setFotoPerfilUrl(picture != null ? picture : "");
        u.setDataCriacao(LocalDateTime.now());
        u.setPermissoes(new ArrayList<>());

        usuarioRepository.save(u);

        List<Usuario> admins = usuarioRepository.findByAtivoTrueAndSituacaoAndCargoIn(
                Usuario.SituacaoUsuario.ATIVO,
                List.of(Cargo.CEO, Cargo.COMPLIANCE, Cargo.MEMBRO_CONSELHO));
        emailService.notificarAdministradoresNovoCadastroGoogle(nome, email, admins);
        notificacaoInternaService.notificarAdministradores(
                "Novo cadastro via Google aguardando aprovação: " + nome + " (" + email + ")");

        return frontendUrl + "/?oauth_pending=1";
    }

    private String gerarCpfUnicoPlaceholder(String googleSub, String email) {
        String base = (googleSub != null && !googleSub.isBlank() ? googleSub : email);
        for (int i = 0; i < 20; i++) {
            long n = (base.hashCode() + 31L * i) & 0x7FFFFFFFFFFFFFFFL;
            String digits = String.format("%011d", n % 100000000000L);
            if (!usuarioRepository.existsByCpf(digits)) {
                return digits;
            }
        }
        String fallback = String.format("%011d", System.nanoTime() % 100000000000L);
        return fallback;
    }

    private static String pkceChallengeS256(String codeVerifier) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(codeVerifier.getBytes(StandardCharsets.US_ASCII));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String enc(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private record PendingPkce(String codeVerifier, LocalDateTime criadoEm) {
    }
}
