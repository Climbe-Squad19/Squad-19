package br.com.residencia.gestao_contratos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.NotificacaoInterna;
import br.com.residencia.gestao_contratos.classes.Usuario;

@Repository
public interface NotificacaoInternaRepository extends JpaRepository<NotificacaoInterna, Long> {

    List<NotificacaoInterna> findByUsuarioOrderByCriadaEmDesc(Usuario usuario);

    long countByUsuarioAndLidaFalse(Usuario usuario);
}
