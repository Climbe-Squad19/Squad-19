package br.com.residencia.gestao_contratos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.residencia.gestao_contratos.classes.DocumentoContrato;

public interface DocumentoContratoRepository extends JpaRepository<DocumentoContrato, Long> {
    List<DocumentoContrato> findByContratoId(Long contratoId);
}