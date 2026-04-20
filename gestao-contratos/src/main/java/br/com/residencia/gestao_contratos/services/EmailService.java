package br.com.residencia.gestao_contratos.services;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import br.com.residencia.gestao_contratos.classes.IntegracaoOAuthToken;
import br.com.residencia.gestao_contratos.classes.Usuario;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final WebClient webClient;
    private final String fromAddress;
    private final String provider;
    private final String gmailAccessToken;
    private final GoogleOAuthTokenService googleOAuthTokenService;

    public EmailService(JavaMailSender mailSender,
            WebClient.Builder webClientBuilder,
            @Value("${app.mail.from:}") String fromAddress,
            @Value("${spring.mail.username:}") String smtpUsername,
            @Value("${app.mail.provider:smtp}") String provider,
            @Value("${app.gmail.api.access-token:}") String gmailAccessToken,
            GoogleOAuthTokenService googleOAuthTokenService) {
        this.mailSender = mailSender;
        this.webClient = webClientBuilder.baseUrl("https://gmail.googleapis.com").build();
        this.fromAddress = fromAddress == null || fromAddress.isBlank() ? smtpUsername : fromAddress;
        this.provider = provider == null ? "smtp" : provider.trim().toLowerCase();
        this.gmailAccessToken = gmailAccessToken;
        this.googleOAuthTokenService = googleOAuthTokenService;
    }

    /** Endereço usado como remetente (MAIL_FROM ou spring.mail.username). */
    public String getRemetentePadrao() {
        return fromAddress;
    }

    public void enviarEmail(String para, String assunto, String conteudo) {
        if (para == null || para.isBlank() || fromAddress == null || fromAddress.isBlank()) {
            return;
        }

        if ("gmail-api".equals(provider)) {
            try {
                enviarViaGmailApi(para, assunto, conteudo);
                return;
            } catch (Exception ignored) {
                // fallback para SMTP caso a Gmail API não esteja disponível.
            }
        }

        try {
            if (enviarViaIntegracaoGmail(para, assunto, conteudo)) {
                return;
            }
        } catch (Exception ignored) {
            // fallback para SMTP
        }

        // "gmail.com" e "gmail" usam SMTP (app password), sem dependência da Gmail API.
        enviarViaSmtp(para, assunto, conteudo);
    }

    private void enviarViaSmtp(String para, String assunto, String conteudo) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(para);
        message.setSubject(assunto);
        message.setText(conteudo);
        mailSender.send(message);
    }

    private void enviarViaGmailApi(String para, String assunto, String conteudo) {
        if (gmailAccessToken == null || gmailAccessToken.isBlank()) {
            throw new RuntimeException("Token OAuth2 da Gmail API não configurado");
        }

        String mimeMessage = "From: " + fromAddress + "\r\n"
                + "To: " + para + "\r\n"
                + "Subject: " + assunto + "\r\n"
                + "Content-Type: text/plain; charset=UTF-8\r\n\r\n"
                + conteudo;

        String raw = java.util.Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(mimeMessage.getBytes(StandardCharsets.UTF_8));

        webClient.post()
                .uri("/gmail/v1/users/me/messages/send")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + gmailAccessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("raw", raw))
                .retrieve()
                .toBodilessEntity()
                .block();
    }

    private boolean enviarViaIntegracaoGmail(String para, String assunto, String conteudo) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return false;
        }

        Optional<String> accessToken = googleOAuthTokenService.getValidAccessTokenForUserEmail(
                authentication.getName(),
                IntegracaoOAuthToken.ProvedorIntegracao.GMAIL);
        if (accessToken.isEmpty()) {
            return false;
        }

        String from = authentication.getName();
        String mimeMessage = "From: " + from + "\r\n"
                + "To: " + para + "\r\n"
                + "Subject: " + assunto + "\r\n"
                + "Content-Type: text/plain; charset=UTF-8\r\n\r\n"
                + conteudo;
        String raw = java.util.Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(mimeMessage.getBytes(StandardCharsets.UTF_8));

        webClient.post()
                .uri("/gmail/v1/users/me/messages/send")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken.get())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("raw", raw))
                .retrieve()
                .toBodilessEntity()
                .block();
        return true;
    }

    /** RF 10.d — boas-vindas após cadastro pelo administrador. */
    public void enviarBoasVindasNovoColaborador(String emailDestino, String nome) {
        if (emailDestino == null || emailDestino.isBlank()) {
            return;
        }
        enviarEmail(
                emailDestino,
                "Bem-vindo ao Climbe",
                "Olá " + nome + ",\n\n"
                        + "Seu cadastro foi concluído no sistema Climbe. Utilize seu e-mail e a senha definida pelo administrador para acessar.\n\n"
                        + "Equipe Climbe\n");
    }

    /** RF 2.d — avisar administradores sobre novo cadastro Google pendente. */
    public void notificarAdministradoresNovoCadastroGoogle(String nomeNovo, String emailNovo,
            List<Usuario> administradores) {
        if (administradores == null || administradores.isEmpty()) {
            return;
        }
        String corpo = "Novo cadastro via Google aguardando aprovação:\n\n"
                + "Nome: " + nomeNovo + "\n"
                + "E-mail: " + emailNovo + "\n\n"
                + "Acesse o sistema em Usuários pendentes para aprovar.\n";
        for (Usuario admin : administradores) {
            if (admin.getEmail() != null && !admin.getEmail().isBlank()) {
                enviarEmail(admin.getEmail(), "[Climbe] Cadastro pendente de aprovação", corpo);
            }
        }
    }
}
