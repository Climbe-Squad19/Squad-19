package br.com.residencia.gestao_contratos.dtos.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContratoCriacaoRequest {
    private Long propostaOrigemId;
    private Long empresaId;
    private Long usuarioResponsavelId;
    private String status;      
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private String linkContratoAssinado;
    private boolean renovacaoAutomatica;
    private Integer diasAvisoVencimento;
    private String observacoes;
}