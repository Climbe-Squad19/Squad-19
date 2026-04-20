package br.com.residencia.gestao_contratos.services;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import br.com.residencia.gestao_contratos.classes.IntegracaoOAuthToken;
import br.com.residencia.gestao_contratos.classes.IntegracaoUsuario;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.dtos.response.IntegracoesUsuarioResponse;
import br.com.residencia.gestao_contratos.repository.IntegracaoOAuthTokenRepository;
import br.com.residencia.gestao_contratos.repository.IntegracaoUsuarioRepository;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Service
public class IntegracaoUsuarioService {

    private final IntegracaoUsuarioRepository integracaoUsuarioRepository;
    private final IntegracaoOAuthTokenRepository integracaoOAuthTokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final WebClient webClient;
    private final String googleClientId;
    private final String googleClientSecret;
    private final String googleRedirectUri;
    private final String frontendUrl;
    private final Map<String, PendingOAuthState> pendingStates = new ConcurrentHashMap<>();
    private static final long STATE_EXPIRATION_MINUTES = 10;
    private static final String GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

    public IntegracaoUsuarioService(
            IntegracaoUsuarioRepository integracaoUsuarioRepository,
            IntegracaoOAuthTokenRepository integracaoOAuthTokenRepository,
            UsuarioRepository usuarioRepository,
            WebClient.Builder webClientBuilder,
            @Value("${app.integrations.google.client-id:}") String googleClientId,
            @Value("${app.integrations.google.client-secret:}") String googleClientSecret,
            @Value("${app.integrations.google.redirect-uri:http://localhost:8081/integracoes/google/callback}") String googleRedirectUri,
            @Value("${app.frontend.url:http://localhost:5173}") String frontendUrl) {
        this.integracaoUsuarioRepository = integracaoUsuarioRepository;
        this.integracaoOAuthTokenRepository = integracaoOAuthTokenRepository;
        this.usuarioRepository = usuarioRepository;
        this.webClient = webClientBuilder.build();
        this.googleClientId = googleClientId;
        this.googleClientSecret = googleClientSecret;
        this.googleRedirectUri = googleRedirectUri;
        this.frontendUrl = frontendUrl;
    }

    public IntegracoesUsuarioResponse buscarIntegracoesDoUsuarioLogado() {
        IntegracaoUsuario integracoes = buscarOuCriarIntegracoesUsuarioLogado();
        return converterParaResponse(integracoes);
    }

    @Transactional
    public IntegracoesUsuarioResponse atualizarIntegracaoDoUsuarioLogado(String integracao, boolean conectado) {
        IntegracaoUsuario item = buscarOuCriarIntegracoesUsuarioLogado();
        IntegracaoOAuthToken.ProvedorIntegracao provedor = parseProvedor(integracao);

        atualizarFlags(item, provedor, conectado);
        IntegracaoUsuario salvo = integracaoUsuarioRepository.save(item);

        if (!conectado) {
            Usuario usuario = buscarUsuarioLogado();
            integracaoOAuthTokenRepository.findByUsuarioAndProvedor(usuario, provedor)
                    .ifPresent(integracaoOAuthTokenRepository::delete);
        }

        return converterParaResponse(salvo);
    }

    public String gerarUrlAutorizacaoGoogle(String integracao) {
        validarConfiguracaoGoogle();
        IntegracaoOAuthToken.ProvedorIntegracao provedor = parseProvedor(integracao);
        Usuario usuario = buscarUsuarioLogado();
        String state = UUID.randomUUID().toString();
        pendingStates.put(state, new PendingOAuthState(usuario.getEmail(), provedor, LocalDateTime.now()));

        return GOOGLE_AUTH_URL
                + "?client_id=" + encode(googleClientId)
                + "&redirect_uri=" + encode(googleRedirectUri)
                + "&response_type=code"
                + "&access_type=offline"
                + "&prompt=consent"
                + "&scope=" + encode(scopePorProvedor(provedor))
                + "&state=" + encode(state);
    }

    @Transactional
    public String processarCallbackGoogle(String code, String state, String error) {
        if (error != null && !error.isBlank()) {
            return frontendUrl + "/?integration_error=" + encode(error);
        }
        if (code == null || code.isBlank() || state == null || state.isBlank()) {
            return frontendUrl + "/?integration_error=missing_code_or_state";
        }

        PendingOAuthState pending = pendingStates.remove(state);
        if (pending == null || pending.criadoEm().plusMinutes(STATE_EXPIRATION_MINUTES).isBefore(LocalDateTime.now())) {
            return frontendUrl + "/?integration_error=invalid_or_expired_state";
        }

        Usuario usuario = usuarioRepository.findByEmail(pending.email())
                .orElseThrow(() -> new RuntimeException("Usuário do estado OAuth não encontrado"));

        Map<String, Object> tokenResponse = webClient.post()
                .uri(GOOGLE_TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData("code", code)
                        .with("client_id", googleClientId)
                        .with("client_secret", googleClientSecret)
                        .with("redirect_uri", googleRedirectUri)
                        .with("grant_type", "authorization_code"))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (tokenResponse == null || tokenResponse.get("access_token") == null) {
            return frontendUrl + "/?integration_error=token_exchange_failed";
        }

        String accessToken = String.valueOf(tokenResponse.get("access_token"));
        String refreshToken = tokenResponse.get("refresh_token") != null
                ? String.valueOf(tokenResponse.get("refresh_token"))
                : null;
        String tokenType = tokenResponse.get("token_type") != null
                ? String.valueOf(tokenResponse.get("token_type"))
                : null;
        String scope = tokenResponse.get("scope") != null
                ? String.valueOf(tokenResponse.get("scope"))
                : null;
        Integer expiresIn = tokenResponse.get("expires_in") instanceof Number
                ? ((Number) tokenResponse.get("expires_in")).intValue()
                : null;

        IntegracaoOAuthToken item = integracaoOAuthTokenRepository
                .findByUsuarioAndProvedor(usuario, pending.provedor())
                .orElseGet(IntegracaoOAuthToken::new);
        item.setUsuario(usuario);
        item.setProvedor(pending.provedor());
        item.setAccessToken(accessToken);
        if (refreshToken != null && !refreshToken.isBlank()) {
            item.setRefreshToken(refreshToken);
        }
        item.setTokenType(tokenType);
        item.setScope(scope);
        item.setExpiresAt(expiresIn != null ? LocalDateTime.now().plusSeconds(expiresIn) : null);
        integracaoOAuthTokenRepository.save(item);

        IntegracaoUsuario integracoes = integracaoUsuarioRepository.findByUsuario(usuario)
                .orElseGet(() -> {
                    IntegracaoUsuario novo = new IntegracaoUsuario();
                    novo.setUsuario(usuario);
                    return novo;
                });
        atualizarFlags(integracoes, pending.provedor(), true);
        integracaoUsuarioRepository.save(integracoes);

        return frontendUrl + "/?integration_success=" + encode(pending.provedor().name().toLowerCase());
    }

    private IntegracaoUsuario buscarOuCriarIntegracoesUsuarioLogado() {
        Usuario usuario = buscarUsuarioLogado();
        return integracaoUsuarioRepository.findByUsuario(usuario)
                .orElseGet(() -> {
                    IntegracaoUsuario novo = new IntegracaoUsuario();
                    novo.setUsuario(usuario);
                    novo.setGoogleDrive(false);
                    novo.setGoogleCalendar(false);
                    novo.setGoogleSheets(false);
                    novo.setGmail(false);
                    return integracaoUsuarioRepository.save(novo);
                });
    }

    private IntegracaoOAuthToken.ProvedorIntegracao parseProvedor(String integracao) {
        String key = integracao == null ? "" : integracao.trim().toLowerCase();
        switch (key) {
            case "googledrive":
                return IntegracaoOAuthToken.ProvedorIntegracao.GOOGLEDRIVE;
            case "googlecalendar":
                return IntegracaoOAuthToken.ProvedorIntegracao.GOOGLECALENDAR;
            case "googlesheets":
                return IntegracaoOAuthToken.ProvedorIntegracao.GOOGLESHEETS;
            case "gmail":
                return IntegracaoOAuthToken.ProvedorIntegracao.GMAIL;
            default:
                throw new RuntimeException("Integração inválida: " + integracao);
        }
    }

    private void atualizarFlags(
            IntegracaoUsuario item,
            IntegracaoOAuthToken.ProvedorIntegracao provedor,
            boolean conectado) {
        switch (provedor) {
            case GOOGLEDRIVE:
                item.setGoogleDrive(conectado);
                break;
            case GOOGLECALENDAR:
                item.setGoogleCalendar(conectado);
                break;
            case GOOGLESHEETS:
                item.setGoogleSheets(conectado);
                break;
            case GMAIL:
                item.setGmail(conectado);
                break;
            default:
                break;
        }
    }

    private String scopePorProvedor(IntegracaoOAuthToken.ProvedorIntegracao provedor) {
        switch (provedor) {
            case GOOGLEDRIVE:
                return "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly";
            case GOOGLECALENDAR:
                return "https://www.googleapis.com/auth/calendar";
            case GOOGLESHEETS:
                return "https://www.googleapis.com/auth/spreadsheets";
            case GMAIL:
                return "https://www.googleapis.com/auth/gmail.send";
            default:
                return "";
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private void validarConfiguracaoGoogle() {
        if (googleClientId == null || googleClientId.isBlank()
                || googleClientSecret == null || googleClientSecret.isBlank()) {
            throw new RuntimeException("Credenciais Google OAuth não configuradas");
        }
    }

    private Usuario buscarUsuarioLogado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário logado não encontrado"));
    }

    private IntegracoesUsuarioResponse converterParaResponse(IntegracaoUsuario item) {
        return new IntegracoesUsuarioResponse(
                item.isGoogleDrive(),
                item.isGoogleCalendar(),
                item.isGoogleSheets(),
                item.isGmail());
    }

    private record PendingOAuthState(
            String email,
            IntegracaoOAuthToken.ProvedorIntegracao provedor,
            LocalDateTime criadoEm) {
    }
}
