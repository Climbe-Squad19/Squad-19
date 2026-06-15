package br.com.residencia.gestao_contratos.dtos.request;

import lombok.Data;

@Data
public class PortalAutenticacaoRequest {
    private String email;
    private String cnpj;
}
