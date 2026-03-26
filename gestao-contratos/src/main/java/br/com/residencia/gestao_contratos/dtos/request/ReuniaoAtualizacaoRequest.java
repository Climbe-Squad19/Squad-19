package br.com.residencia.gestao_contratos.dtos.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReuniaoAtualizacaoRequest {
    private String pauta;
    private LocalDateTime dataHora;
    private boolean presencial;
    private String linkOnline;
    private String sala;
    private String status;    
    private List<Long> participantesIds;

}