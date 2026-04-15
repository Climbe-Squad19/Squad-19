package br.com.residencia.gestao_contratos.dtos.response;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardUpcomingDueDateResponse {
    private String empresa;
    private String referencia;
    private LocalDate dataVencimento;
}
