package br.com.residencia.gestao_contratos.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.residencia.gestao_contratos.Security.JwtService;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.dtos.request.AutenticacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.ForgotPasswordRequest;
import br.com.residencia.gestao_contratos.dtos.request.ResetPasswordRequest;
import br.com.residencia.gestao_contratos.dtos.response.TokenResponse;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;
import br.com.residencia.gestao_contratos.services.PasswordResetService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

        @Autowired
        private PasswordResetService passwordResetService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AutenticacaoRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getSenha()
                    )
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Email ou senha inválidos");
        }

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!usuario.isAtivo()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Usuário inativo");
        }

        String token = jwtService.gerarToken(
                usuario.getEmail(),
                usuario.getId(),
                usuario.getCargo().name()
        );

        TokenResponse response = new TokenResponse();
        response.setAccessToken(token);
        response.setTokenType("Bearer");
        response.setExpiresIn(86400000L); 

        return ResponseEntity.ok(response);
    }

        @PostMapping("/forgot-password")
        public ResponseEntity<String> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
                passwordResetService.solicitarReset(request.getEmail());
                return ResponseEntity.ok("Se o e-mail existir, enviaremos instruções para redefinir sua senha.");
        }

        @PostMapping("/reset-password")
        public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
                try {
                        passwordResetService.redefinirSenha(request.getToken(), request.getNovaSenha());
                        return ResponseEntity.ok("Senha redefinida com sucesso.");
                } catch (RuntimeException ex) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
                }
        }
}