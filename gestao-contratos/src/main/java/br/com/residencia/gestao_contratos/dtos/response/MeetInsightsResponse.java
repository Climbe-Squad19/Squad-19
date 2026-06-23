package br.com.residencia.gestao_contratos.dtos.response;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetInsightsResponse {
    private String meetingCode;
    private int participantes;
    private Long duracaoMinutos;
    private boolean possuiGravacao;
    private List<MeetRecordingItemResponse> gravacoes;

    public static MeetInsightsResponse semDados(String meetingCode) {
        return new MeetInsightsResponse(meetingCode, 0, null, false, new ArrayList<>());
    }
}
