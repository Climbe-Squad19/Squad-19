package br.com.residencia.gestao_contratos.dtos.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropostaResponse {
    private Long id;
    private Long empresaId;
    private String nomeEmpresa;
    private Long criadoPorId;
    private String servicoContratado;
    private BigDecimal valorMensal;
    private BigDecimal valorSetup;
    private LocalDate dataEmissao;
    private String linkGoogleDrive;
    private String status;
    private String motivoRecusa;
    private LocalDateTime dataCriacao;
    private String nomeCriadoPor;
}