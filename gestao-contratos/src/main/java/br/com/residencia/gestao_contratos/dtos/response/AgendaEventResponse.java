package br.com.residencia.gestao_contratos.dtos.response;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgendaEventResponse {
    private Long id;
    private String title;
    private String company;
    private String time;
    private String location;
    private String status;
    private boolean presencial;
    private String linkOnline;
    private LocalDateTime dateTime;
}
