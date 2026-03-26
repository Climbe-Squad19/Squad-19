package br.com.residencia.gestao_contratos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByCpf(String cpf);    
    
    boolean existsByEmail(String email);
    
    Optional<Usuario> findByEmail(String email);
}