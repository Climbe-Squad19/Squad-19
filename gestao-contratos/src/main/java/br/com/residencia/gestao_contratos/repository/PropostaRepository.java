package br.com.residencia.gestao_contratos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.Proposta;

@Repository
public interface PropostaRepository extends JpaRepository<Proposta, Long> {
}