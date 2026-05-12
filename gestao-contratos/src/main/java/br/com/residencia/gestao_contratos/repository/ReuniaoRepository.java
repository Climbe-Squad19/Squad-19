package br.com.residencia.gestao_contratos.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.com.residencia.gestao_contratos.classes.Reuniao;

@Repository
public interface ReuniaoRepository extends JpaRepository<Reuniao, Long> {
    List<Reuniao> findByDataHoraBetween(LocalDateTime start, LocalDateTime end);

    long countByDataHoraBetweenAndStatusNot(
            LocalDateTime start,
            LocalDateTime end,
            Reuniao.StatusReuniao status);
}