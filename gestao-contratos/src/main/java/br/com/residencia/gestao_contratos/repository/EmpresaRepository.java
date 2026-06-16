package br.com.residencia.gestao_contratos.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.Empresa;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Long> {
    boolean existsByCnpj(String cnpj);     
    Optional<Empresa> findByCnpj(String cnpj);

    @Query("""
            select e from Empresa e
            where replace(replace(replace(replace(e.cnpj, '.', ''), '/', ''), '-', ''), ' ', '') = :cnpj
            """)
    Optional<Empresa> findByCnpjNormalizado(@Param("cnpj") String cnpj);
}
