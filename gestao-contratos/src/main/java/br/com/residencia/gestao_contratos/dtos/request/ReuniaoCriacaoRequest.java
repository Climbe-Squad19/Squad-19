package br.com.residencia.gestao_contratos.dtos.request;

import java.time.LocalDateTime;
import java.util.List;

import br.com.residencia.gestao_contratos.classes.Reuniao;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReuniaoCriacaoRequest {
    private String pauta;
    private Long empresaId;
    private Long contratoId;
    private Reuniao.TipoReuniao tipo;   
    private LocalDateTime dataHora;
    private boolean presencial;
    private String linkOnline;
    private String sala;
    private List<Long> participantesIds;
}