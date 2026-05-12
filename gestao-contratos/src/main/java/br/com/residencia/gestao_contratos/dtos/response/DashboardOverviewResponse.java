package br.com.residencia.gestao_contratos.dtos.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponse {
    private long propostasPendentes;
    private long contratosAtivos;
    private long documentosPendentes;
    private long reunioesSemana;
    private List<DashboardRecentContractResponse> ultimosContratos;
    private List<DashboardUpcomingDueDateResponse> proximosVencimentos;
}
