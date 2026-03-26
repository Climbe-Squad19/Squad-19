package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.dtos.response.UsuarioResponse;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponse cadastrarUsuario(Usuario usuario) {
        if (usuarioRepository.existsByCpf(usuario.getCpf())) {
            throw new IllegalArgumentException("Erro: CPF já registado no sistema.");
        }
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new IllegalArgumentException("Erro: E-mail já registado no sistema.");
        }

        if (usuario.getSenha() != null && !usuario.getSenha().isEmpty()) {
            String senhaEncriptada = passwordEncoder.encode(usuario.getSenha());
            usuario.setSenha(senhaEncriptada);
        }

        usuario.setDataCriacao(LocalDateTime.now());
        usuario.setSituacao(Usuario.SituacaoUsuario.ATIVO);
        usuario.setAtivo(true);
        
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        return converterParaResponse(usuarioGuardado);
    }

    public UsuarioResponse buscarPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilizador não encontrado."));
        
        return converterParaResponse(usuario);
    }

    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
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
            String cpfMascarado = "****" + usuario.getCpf().substring(4, 7) + "****";
            response.setCpf(cpfMascarado);
        } else {
            response.setCpf(usuario.getCpf()); 
        }

        return response;
    }
}