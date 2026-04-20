package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.residencia.gestao_contratos.classes.PasswordResetToken;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.repository.PasswordResetTokenRepository;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Service
public class PasswordResetService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final String frontendBaseUrl;

    public PasswordResetService(
            UsuarioRepository usuarioRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            @Value("${app.frontend.url:http://localhost:5173}") String frontendBaseUrl) {
        this.usuarioRepository = usuarioRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Transactional
    public void solicitarReset(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null) {
            return;
        }

        tokenRepository.deleteByExpiracaoBefore(LocalDateTime.now());
        tokenRepository.findByUsuarioAndUsadoFalse(usuario).forEach(token -> {
            token.setUsado(true);
            tokenRepository.save(token);
        });

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUsuario(usuario);
        resetToken.setUsado(false);
        resetToken.setDataCriacao(LocalDateTime.now());
        resetToken.setExpiracao(LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(resetToken);

        String resetLink = frontendBaseUrl + "/forgot-password?token=" + token;
        String body = "Olá, " + usuario.getNomeCompleto() + ",\n\n"
                + "Recebemos uma solicitação para redefinir sua senha.\n"
                + "Use o link abaixo para criar uma nova senha (válido por 30 minutos):\n"
                + resetLink + "\n\n"
                + "Se você não solicitou esta alteração, ignore este e-mail.";

        emailService.enviarEmail(usuario.getEmail(), "Recuperação de senha - Climbe", body);
    }

    @Transactional
    public void redefinirSenha(String token, String novaSenha) {
        PasswordResetToken resetToken = tokenRepository.findByTokenAndUsadoFalse(token)
                .orElseThrow(() -> new RuntimeException("Token inválido ou já utilizado"));

        if (resetToken.getExpiracao().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expirado");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        resetToken.setUsado(true);
        tokenRepository.save(resetToken);

        emailService.enviarEmail(usuario.getEmail(),
                "Senha alterada com sucesso - Climbe",
                "Sua senha foi alterada com sucesso. Se você não reconhece esta ação, entre em contato imediatamente.");
    }
}
