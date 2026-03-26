package br.com.residencia.gestao_contratos.dtos.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReuniaoResponse {
    private Long id;
    private String pauta;
    private Long empresaId;
    private String nomeEmpresa;
    private Long contratoId;
    private LocalDateTime dataHora;
    private boolean presencial;
    private String linkOnline;
    private String sala;
    private String status;  
    private List<Long> participantesIds;
    private LocalDateTime dataCriacao;
}