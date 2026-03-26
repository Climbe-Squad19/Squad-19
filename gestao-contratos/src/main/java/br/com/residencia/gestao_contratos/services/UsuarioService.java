package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.dtos.request.UsuarioAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.UsuarioCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.UsuarioResponse;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponse criar(UsuarioCriacaoRequest request) {

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
        return converterParaResponse(salvo);
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
        response.setFotoPerfilUrl(usuario.getFotoPerfilUrl());
        response.setDataCriacao(usuario.getDataCriacao());


        if (usuario.getCpf() != null && usuario.getCpf().length() == 11) {
            String cpf = usuario.getCpf();
            response.setCpf("***" + cpf.substring(3, 9) + "**");
        }

        return response;
    }
}