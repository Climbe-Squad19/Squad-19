package br.com.residencia.gestao_contratos.dtos.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReuniaoCriacaoRequest {
    private String pauta;
    private Long empresaId;
    private Long contratoId;
    private LocalDateTime dataHora;
    private boolean presencial;
    private String linkOnline;
    private String sala;
    private List<Long> participantesIds;
}