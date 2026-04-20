package br.com.residencia.gestao_contratos.dtos.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalendarDayResponse {
    private int day;
    private long eventCount;
    private boolean hasEvents;
}
