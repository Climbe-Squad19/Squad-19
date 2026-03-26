package br.com.residencia.gestao_contratos.dtos.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContratoAtualizacaoRequest {
    private LocalDate dataFim;
    private String linkContratoAssinado;
    private boolean renovacaoAutomatica;
    private Integer diasAvisoVencimento;
    private String status;
    private String observacoes;
}