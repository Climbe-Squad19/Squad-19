package br.com.residencia.gestao_contratos.dtos.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAtualizacaoRequest {
    private String nomeCompleto;
    private String cargo;
    private String telefone;
    private boolean ativo;
    private String senha; 
    private List<String> permissoes;

}