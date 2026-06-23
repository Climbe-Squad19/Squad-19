package br.com.residencia.gestao_contratos.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.ReuniaoGravacao;

@Repository
public interface ReuniaoGravacaoRepository extends JpaRepository<ReuniaoGravacao, Long> {
    List<ReuniaoGravacao> findByReuniaoIdOrderByUltimaSincronizacaoDesc(Long reuniaoId);

    Optional<ReuniaoGravacao> findByRecordingName(String recordingName);
}
