package br.com.residencia.gestao_contratos.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.dtos.response.NotificacaoInternaResponse;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;
import br.com.residencia.gestao_contratos.services.NotificacaoInternaService;

@RestController
@RequestMapping("/notificacoes/internas")
public class NotificacaoInternaController {

    private final NotificacaoInternaService notificacaoInternaService;
    private final UsuarioRepository usuarioRepository;

    public NotificacaoInternaController(
            NotificacaoInternaService notificacaoInternaService,
            UsuarioRepository usuarioRepository) {
        this.notificacaoInternaService = notificacaoInternaService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<NotificacaoInternaResponse>> minhas() {
        Usuario u = usuarioAtual();
        return ResponseEntity.ok(notificacaoInternaService.listarParaUsuario(u));
    }

    @PatchMapping("/{id}/lida")
    public ResponseEntity<Void> marcarLida(@PathVariable Long id) {
        notificacaoInternaService.marcarLida(id, usuarioAtual());
        return ResponseEntity.noContent().build();
    }

    private Usuario usuarioAtual() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
}
