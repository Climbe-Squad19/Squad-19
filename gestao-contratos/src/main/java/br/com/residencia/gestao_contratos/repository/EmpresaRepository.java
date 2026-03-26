package br.com.residencia.gestao_contratos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.Empresa;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    boolean existsByCnpj(String cnpj);     
    java.util.Optional<Empresa> findByCnpj(String cnpj);
}