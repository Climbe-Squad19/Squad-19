package br.com.residencia.gestao_contratos.dtos.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropostaCriacaoRequest {
    private Long empresaId;
    private String servicoContratado;
    private BigDecimal valorMensal;
    private BigDecimal valorSetup;
    private LocalDate dataEmissao;
    private String linkGoogleDrive;
}