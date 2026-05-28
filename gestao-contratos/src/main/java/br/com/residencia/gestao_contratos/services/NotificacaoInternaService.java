package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.residencia.gestao_contratos.classes.Cargo;
import br.com.residencia.gestao_contratos.classes.NotificacaoInterna;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.dtos.response.NotificacaoInternaResponse;
import br.com.residencia.gestao_contratos.repository.NotificacaoInternaRepository;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Service
public class NotificacaoInternaService {

    private static final List<Cargo> CARGOS_NOTIFICAR = List.of(
            Cargo.CEO, Cargo.COMPLIANCE, Cargo.MEMBRO_CONSELHO);

    private final NotificacaoInternaRepository notificacaoInternaRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacaoInternaService(
            NotificacaoInternaRepository notificacaoInternaRepository,
            UsuarioRepository usuarioRepository) {
        this.notificacaoInternaRepository = notificacaoInternaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public void notificarAdministradores(String mensagem) {
        List<Usuario> destinatarios = usuarioRepository.findByAtivoTrueAndSituacaoAndCargoIn(
                Usuario.SituacaoUsuario.ATIVO,
                CARGOS_NOTIFICAR);
        LocalDateTime agora = LocalDateTime.now();
        for (Usuario u : destinatarios) {
            NotificacaoInterna n = new NotificacaoInterna();
            n.setUsuario(u);
            n.setMensagem(mensagem);
            n.setLida(false);
            n.setCriadaEm(agora);
            notificacaoInternaRepository.save(n);
        }
    }

    public List<NotificacaoInternaResponse> listarParaUsuario(Usuario usuario) {
        return notificacaoInternaRepository.findByUsuarioOrderByCriadaEmDesc(usuario).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void marcarLida(Long id, Usuario usuario) {
        NotificacaoInterna n = notificacaoInternaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificação não encontrada"));
        if (!n.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("Acesso negado");
        }
        n.setLida(true);
        notificacaoInternaRepository.save(n);
    }

    public long contarNaoLidas(Usuario usuario) {
        return notificacaoInternaRepository.countByUsuarioAndLidaFalse(usuario);
    }

    private NotificacaoInternaResponse toResponse(NotificacaoInterna n) {
        return new NotificacaoInternaResponse(
                n.getId(),
                n.getMensagem(),
                n.isLida(),
                n.getCriadaEm());
    }
}
