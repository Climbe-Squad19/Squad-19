package br.com.residencia.gestao_contratos.dtos.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OAuth2CallBackRequest {
    private String code;
    private String state;
}