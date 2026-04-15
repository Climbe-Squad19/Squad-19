package br.com.residencia.gestao_contratos.dtos.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardRecentContractResponse {
    private String empresa;
    private String servico;
    private LocalDateTime dataCriacao;
}
