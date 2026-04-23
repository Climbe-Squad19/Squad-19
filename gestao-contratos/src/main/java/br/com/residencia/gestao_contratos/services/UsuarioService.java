package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import br.com.residencia.gestao_contratos.classes.Cargo;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.dtos.request.UsuarioAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.UsuarioCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.AuthMeResponse;
import br.com.residencia.gestao_contratos.dtos.response.UsuarioResponse;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AdministrativoAuthorizationService administrativoAuthorizationService;

    @Autowired
    private EmailService emailService;

    @Transactional
    public UsuarioResponse criar(UsuarioCriacaoRequest request) {
        administrativoAuthorizationService.exigirPodeGerenciarUsuarios();

        if (usuarioRepository.existsByCpf(request.getCpf()))
            throw new RuntimeException("CPF já cadastrado");

        if (usuarioRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email já cadastrado");

        Usuario usuario = new Usuario();
        usuario.setNomeCompleto(request.getNomeCompleto());
        usuario.setCargo(request.getCargo());
        usuario.setPermissoes(request.getPermissoes());
        usuario.setCpf(request.getCpf());
        usuario.setEmail(request.getEmail());
        usuario.setTelefone(request.getTelefone());
        usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        usuario.setAtivo(true);
        usuario.setSituacao(Usuario.SituacaoUsuario.ATIVO);
        usuario.setDataCriacao(LocalDateTime.now());

        Usuario salvo = usuarioRepository.save(usuario);
        try {
            emailService.enviarBoasVindasNovoColaborador(salvo.getEmail(), salvo.getNomeCompleto());
        } catch (Exception ignored) {
            // SMTP não configurado não deve impedir o cadastro
        }
        return converterParaResponse(salvo);
    }

    public List<UsuarioResponse> listarPendentes() {
        administrativoAuthorizationService.exigirPodeGerenciarUsuarios();
        return usuarioRepository.findBySituacao(Usuario.SituacaoUsuario.PENDENTE).stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UsuarioResponse aprovarCadastro(Long id) {
        administrativoAuthorizationService.exigirPodeGerenciarUsuarios();
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
        if (usuario.getSituacao() != Usuario.SituacaoUsuario.PENDENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Somente contas pendentes podem ser aprovadas.");
        }
        usuario.setSituacao(Usuario.SituacaoUsuario.ATIVO);
        usuario.setAtivo(true);
        if (usuario.getCargo() == null) {
            usuario.setCargo(Cargo.ANALISTA_TRAINEE);
            usuario.setPermissoes(List.of(Cargo.ANALISTA_TRAINEE));
        }
        usuarioRepository.save(usuario);
        try {
            emailService.enviarBoasVindasNovoColaborador(usuario.getEmail(), usuario.getNomeCompleto());
        } catch (Exception ignored) {
            // idem
        }
        return converterParaResponse(usuario);
    }

    @Transactional
    public UsuarioResponse atualizar(Long id, UsuarioAtualizacaoRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setNomeCompleto(request.getNomeCompleto());
        usuario.setCargo(request.getCargo());
        usuario.setPermissoes(request.getPermissoes());
        usuario.setTelefone(request.getTelefone());
        usuario.setAtivo(request.isAtivo());

        if (request.getSenha() != null && !request.getSenha().isEmpty()) {
            usuario.setSenha(passwordEncoder.encode(request.getSenha()));
        }

        Usuario atualizado = usuarioRepository.save(usuario);
        return converterParaResponse(atualizado);
    }

    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    public List<UsuarioResponse> listarPorCargos(List<Cargo> cargos) {
        return usuarioRepository.findByCargoIn(cargos).stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    public List<UsuarioResponse> listarAnalistas() {
        return listarPorCargos(List.of(
                Cargo.ANALISTA_TRAINEE,
                Cargo.ANALISTA_JUNIOR,
                Cargo.ANALISTA_PLENO,
                Cargo.ANALISTA_SENIOR,
                Cargo.ANALISTA_BPO
        ));
    }

    /** Dados do usuário logado + se pode aprovar cadastros (CEO / Compliance / Conselho). */
    public AuthMeResponse authMe() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        String email = auth.getName();
        Usuario u = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        boolean pode = administrativoAuthorizationService.podeGerenciarUsuarios(u);
        return new AuthMeResponse(converterParaResponse(u), pode);
    }

    public UsuarioResponse buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return converterParaResponse(usuario);
    }

    @Transactional
    public void inativar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));


        usuario.setAtivo(false);
        usuario.setSituacao(Usuario.SituacaoUsuario.INATIVO);
        usuarioRepository.save(usuario);
    }

    private UsuarioResponse converterParaResponse(Usuario usuario) {
        UsuarioResponse response = new UsuarioResponse();
        response.setId(usuario.getId());
        response.setNomeCompleto(usuario.getNomeCompleto());
        response.setCargo(usuario.getCargo());
        response.setPermissoes(usuario.getPermissoes());
        response.setEmail(usuario.getEmail());
        response.setTelefone(usuario.getTelefone());
        response.setAtivo(usuario.isAtivo());
        response.setSituacao(usuario.getSituacao());
        response.setFotoPerfilUrl(usuario.getFotoPerfilUrl());
        response.setDataCriacao(usuario.getDataCriacao());


        if (usuario.getCpf() != null && usuario.getCpf().length() == 11) {
            String cpf = usuario.getCpf();
            response.setCpf("***" + cpf.substring(3, 9) + "**");
        }

        return response;
    }
}