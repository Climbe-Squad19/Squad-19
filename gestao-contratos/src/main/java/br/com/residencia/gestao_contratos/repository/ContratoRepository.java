package br.com.residencia.gestao_contratos.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.Contrato;

@Repository
public interface ContratoRepository extends JpaRepository<Contrato, Long> {
    long countByStatus(Contrato.StatusContrato status);

    List<Contrato> findTop5ByOrderByDataCriacaoDesc();

    List<Contrato> findTop10ByStatusAndDataFimGreaterThanEqualOrderByDataFimAsc(
            Contrato.StatusContrato status,
            LocalDate dataFim);
}