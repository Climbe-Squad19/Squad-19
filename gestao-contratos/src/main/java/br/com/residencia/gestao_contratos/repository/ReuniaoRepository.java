package br.com.residencia.gestao_contratos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.Reuniao;

@Repository
public interface ReuniaoRepository extends JpaRepository<Reuniao, Long> {
}