package br.com.residencia.gestao_contratos.dtos.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificacaoInternaResponse {
    private Long id;
    private String mensagem;
    private boolean lida;
    private LocalDateTime criadaEm;
}
