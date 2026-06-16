package br.com.residencia.gestao_contratos.dtos.request;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.Data;

@Data
public class PortalAutenticacaoRequest {
    private String email;

    @JsonAlias("senha")
    private String cnpj;
}
