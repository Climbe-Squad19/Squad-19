package br.com.residencia.gestao_contratos.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.Cargo;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.classes.Usuario.SituacaoUsuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByCpf(String cpf);

    boolean existsByEmail(String email);

    Optional<Usuario> findByEmail(String email);

    List<Usuario> findByCargoIn(List<Cargo> cargos);

    List<Usuario> findBySituacao(SituacaoUsuario situacao);

    List<Usuario> findByAtivoTrueAndSituacaoAndCargoIn(SituacaoUsuario situacao, Collection<Cargo> cargos);
}