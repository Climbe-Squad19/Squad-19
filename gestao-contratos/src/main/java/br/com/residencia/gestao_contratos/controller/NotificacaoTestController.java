package br.com.residencia.gestao_contratos.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.residencia.gestao_contratos.services.EmailService;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoTestController {

    @Autowired
    private EmailService emailService;

    @Value("${app.mail.test-endpoint-enabled:false}")
    private boolean testEndpointEnabled;

    /**
     * Envia um e-mail de teste para o usuário autenticado (mesmo e-mail do login).
     * Util para validar SMTP Gmail ou integração Gmail OAuth no dashboard.
     * Desligado em produção: defina MAIL_TEST_ENDPOINT_ENABLED=true para habilitar.
     */
    @PostMapping("/teste-email")
    public ResponseEntity<Map<String, Object>> testarEmail(Authentication authentication) {
        if (!testEndpointEnabled) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        if (authentication == null || !StringUtils.hasText(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String destinatario = authentication.getName();
        if (!StringUtils.hasText(emailService.getRemetentePadrao())) {
            return ResponseEntity.badRequest().body(Map.of(
                    "ok", false,
                    "erro", "Configure MAIL_USERNAME e MAIL_FROM (ou spring.mail.username / app.mail.from) como remetente Gmail."));
        }
        try {
            emailService.enviarEmail(
                    destinatario,
                    "Climbe — teste de notificação",
                    "Se você recebeu esta mensagem, o envio de e-mails está funcionando.\n\n"
                            + "Ordem de envio no sistema: Gmail API (MAIL_PROVIDER=gmail-api), depois integração Gmail (OAuth no painel), depois SMTP (MAIL_APP_PASSWORD).");
            return ResponseEntity.ok(Map.of(
                    "ok", true,
                    "mensagem", "E-mail de teste enviado.",
                    "destinatario", destinatario));
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "ok", false,
                    "erro", msg));
        }
    }
}
