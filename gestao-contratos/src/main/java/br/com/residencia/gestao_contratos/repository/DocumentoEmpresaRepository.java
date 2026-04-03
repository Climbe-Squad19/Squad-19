package br.com.residencia.gestao_contratos.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.DocumentoEmpresa;

@Repository
public interface DocumentoEmpresaRepository
        extends JpaRepository<DocumentoEmpresa, Long> {

    List<DocumentoEmpresa> findByEmpresaId(Long empresaId);

    List<DocumentoEmpresa> findByEmpresaIdAndStatus(
            Long empresaId,
            DocumentoEmpresa.StatusDocumento status);
}