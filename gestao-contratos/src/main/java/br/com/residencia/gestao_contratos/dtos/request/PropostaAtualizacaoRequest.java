package br.com.residencia.gestao_contratos.dtos.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropostaAtualizacaoRequest {
    private String servicoContratado;
    private BigDecimal valorMensal;
    private BigDecimal valorSetup;
    private String linkGoogleDrive;
    private String motivoRecusa; 
}