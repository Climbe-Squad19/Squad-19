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

@Service
public class AdministrativoAuthorizationService {

    private static final Set<Cargo> CARGOS_ADMINISTRATIVOS = EnumSet.of(
            Cargo.CEO,
            Cargo.COMPLIANCE,
            Cargo.MEMBRO_CONSELHO);

    private static final Set<Cargo> CARGOS_CRIAR_PROPOSTA = EnumSet.of(
            Cargo.CEO,
            Cargo.CMO,
            Cargo.CSO,
            Cargo.ANALISTA_TRAINEE,
            Cargo.ANALISTA_JUNIOR,
            Cargo.ANALISTA_PLENO,
            Cargo.ANALISTA_SENIOR,
            Cargo.ANALISTA_BPO,
            Cargo.CONTADOR);

    private final UsuarioRepository usuarioRepository;

    public AdministrativoAuthorizationService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario usuarioAtual() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessao invalida"));
    }

    public void exigirPodeGerenciarUsuarios() {
        Usuario atual = usuarioAtual();
        if (!podeGerenciarUsuarios(atual)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Apenas perfis administrativos podem realizar esta acao.");
        }
    }

    public void exigirPodeCriarProposta() {
        exigirCargoOuCeo(CARGOS_CRIAR_PROPOSTA,
                "Apenas CMO, CSO, CEO, Analistas ou Contador podem criar propostas.");
    }

    public void exigirPodeGerarContrato() {
        exigirCargoOuCeo(Set.of(Cargo.COMPLIANCE),
                "Apenas Compliance pode gerar contratos.");
    }

    public boolean podeGerarContrato(Usuario usuario) {
        return isCeo(usuario) || temCargoOuPermissao(usuario, Cargo.COMPLIANCE);
    }

    public void exigirPodeEditarEmpresa() {
        exigirCargoOuCeo(CARGOS_ADMINISTRATIVOS,
                "Editar dados cadastrais de empresas exige autorizacao administrativa.");
    }

    public void exigirPodeValidarDocumento(Usuario responsavel) {
        Usuario atual = usuarioAtual();
        if (isCeo(atual)) {
            return;
        }
        if (responsavel != null
                && responsavel.getId() != null
                && responsavel.getId().equals(atual.getId())
                && isAnalista(atual.getCargo())) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "A validacao de documentos e exclusiva do Analista responsavel.");
    }

    public boolean podeGerenciarUsuarios(Usuario usuario) {
        if (!usuarioAtivo(usuario)) {
            return false;
        }
        return isCeo(usuario)
                || temCargoOuPermissao(usuario, Cargo.COMPLIANCE)
                || temCargoOuPermissao(usuario, Cargo.MEMBRO_CONSELHO);
    }

    public boolean isCeo(Usuario usuario) {
        return temCargoOuPermissao(usuario, Cargo.CEO);
    }

    public boolean isAnalista(Cargo cargo) {
        return cargo == Cargo.ANALISTA_TRAINEE
                || cargo == Cargo.ANALISTA_JUNIOR
                || cargo == Cargo.ANALISTA_PLENO
                || cargo == Cargo.ANALISTA_SENIOR
                || cargo == Cargo.ANALISTA_BPO;
    }

    public boolean temCargoOuPermissao(Usuario usuario, Cargo cargo) {
        if (usuario == null || cargo == null) {
            return false;
        }
        if (usuario.getCargo() == cargo) {
            return true;
        }
        return usuario.getPermissoes() != null && usuario.getPermissoes().contains(cargo);
    }

    private boolean usuarioAtivo(Usuario usuario) {
        if (usuario == null || !usuario.isAtivo()) {
            return false;
        }
        Usuario.SituacaoUsuario situacao = usuario.getSituacao() != null
                ? usuario.getSituacao()
                : Usuario.SituacaoUsuario.ATIVO;
        return situacao == Usuario.SituacaoUsuario.ATIVO;
    }

    private void exigirCargoOuCeo(Set<Cargo> cargosPermitidos, String mensagem) {
        Usuario atual = usuarioAtual();
        if (isCeo(atual)) {
            return;
        }
        if (atual.getCargo() != null && cargosPermitidos.contains(atual.getCargo())) {
            return;
        }
        if (atual.getPermissoes() != null
                && atual.getPermissoes().stream().anyMatch(cargosPermitidos::contains)) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, mensagem);
    }
}
