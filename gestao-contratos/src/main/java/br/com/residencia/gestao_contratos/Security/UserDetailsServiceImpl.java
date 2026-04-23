package br.com.residencia.gestao_contratos.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuário não encontrado: " + email));

        Usuario.SituacaoUsuario sit = usuario.getSituacao() != null
                ? usuario.getSituacao()
                : Usuario.SituacaoUsuario.ATIVO;
        boolean contaHabilitada = usuario.isAtivo()
                && sit != Usuario.SituacaoUsuario.PENDENTE
                && sit != Usuario.SituacaoUsuario.INATIVO;

        List<SimpleGrantedAuthority> authorities = usuario.getPermissoes() == null ? List.of()
                : usuario.getPermissoes()
                .stream()
                .map(cargo -> new SimpleGrantedAuthority("ROLE_" + cargo.name()))
                .collect(Collectors.toList());

        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getSenha() != null ? usuario.getSenha() : "")
                .authorities(authorities)
                .disabled(!contaHabilitada)
                .build();
    }
}