package br.com.residencia.gestao_contratos.services;

import java.util.EnumSet;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import br.com.residencia.gestao_contratos.classes.Cargo;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

/**
 * Perfis que podem cadastrar usuários e aprovar contas (RF 10 do documento Climbe).
 */
@Service
public class AdministrativoAuthorizationService {

    private static final Set<Cargo> CARGOS_ADMINISTRATIVOS = EnumSet.of(
            Cargo.CEO,
            Cargo.COMPLIANCE,
            Cargo.MEMBRO_CONSELHO
    );

    private final UsuarioRepository usuarioRepository;

    public AdministrativoAuthorizationService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void exigirPodeGerenciarUsuarios() {
        Usuario atual = usuarioAtual();
        if (!podeGerenciarUsuarios(atual)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Apenas perfis administrativos (CEO, Compliance ou Membro do Conselho) podem realizar esta ação.");
        }
    }

    public boolean podeGerenciarUsuarios(Usuario usuario) {
        if (usuario == null || !usuario.isAtivo()) {
            return false;
        }
        if (usuario.getSituacao() != Usuario.SituacaoUsuario.ATIVO) {
            return false;
        }
        if (usuario.getCargo() != null && CARGOS_ADMINISTRATIVOS.contains(usuario.getCargo())) {
            return true;
        }
        return usuario.getPermissoes() != null
                && usuario.getPermissoes().stream().anyMatch(CARGOS_ADMINISTRATIVOS::contains);
    }

    private Usuario usuarioAtual() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessão inválida"));
    }
}
