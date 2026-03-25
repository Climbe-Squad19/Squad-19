package br.com.residencia.gestao_contratos.dtos.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContratoResponse {
    private Long id;
    private Long propostaOrigemId;
    private Long empresaId;
    private String nomeEmpresa;
    private String tipoServico;
    private String status;
    private LocalDate dataInicio;
    private LocalDate dataFim;
    private Integer diasAvisoVencimento;
    private String linkContratoAssinado;
    private boolean renovacaoAutomatica;
    private String observacoes;
    private Long usuarioResponsavelId;
    private LocalDateTime dataCriacao;
}