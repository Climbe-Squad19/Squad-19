package br.com.residencia.gestao_contratos.dtos.response;

import java.util.ArrayList;
import java.util.List;

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
    /** Trechos dos compromissos do dia (ordenados por horário), para exibição estilo Google Calendar */
    private List<CalendarEventSnippetResponse> events = new ArrayList<>();
}
