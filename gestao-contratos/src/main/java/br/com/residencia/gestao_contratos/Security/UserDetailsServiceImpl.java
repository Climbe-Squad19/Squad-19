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

        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuário não encontrado: " + email));

        if (!usuario.isAtivo()) {
            throw new UsernameNotFoundException("Usuário inativo: " + email);
        }

        List<SimpleGrantedAuthority> authorities = usuario.getPermissoes()
                .stream()
                .map(cargo -> new SimpleGrantedAuthority("ROLE_" + cargo.name()))
                .collect(Collectors.toList());

        return new User(
                usuario.getEmail(),
                usuario.getSenha(),
                authorities
        );
    }
}