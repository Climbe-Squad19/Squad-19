package br.com.residencia.gestao_contratos.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IntegracoesUsuarioResponse {
    private boolean googleDrive;
    private boolean googleCalendar;
    private boolean googleSheets;
    private boolean gmail;
}
