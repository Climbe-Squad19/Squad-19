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
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        
        if (usuario.getId() == null) {
            usuario.setDataCriacao(LocalDateTime.now());
            usuario.setAtivo(true);
        }

        Usuario salvo = usuarioRepository.save(usuario);
        return converterParaResponse(salvo);
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
    public void excluir(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado para exclusão");
        }
        usuarioRepository.deleteById(id);
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
            String cpfOriginal = usuario.getCpf();
            String cpfMascarado = "****" + cpfOriginal.substring(4, 7) + "****";
            response.setCpf(cpfMascarado);
        }

        return response;
    }
}