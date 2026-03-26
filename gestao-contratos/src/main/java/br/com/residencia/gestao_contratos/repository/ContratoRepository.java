package br.com.residencia.gestao_contratos.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.Contrato;

@Repository
public interface ContratoRepository extends JpaRepository<Contrato, Long> {
}