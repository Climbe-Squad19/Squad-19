package br.com.residencia.gestao_contratos.dtos.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReuniaoGravacaoResponse {
    private Long id;
    private Long reuniaoId;
    private String meetingCode;
    private String recordingName;
    private String estado;
    private String driveFile;
    private String url;
    private LocalDateTime ultimaSincronizacao;
}
