package br.com.residencia.gestao_contratos.dtos.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAtualizacaoRequest {
    private String nomeCompleto;
    private String cargo;
    private String telefone;
    private boolean ativo;
    private List<String> permissoes;
}