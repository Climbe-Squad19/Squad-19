package br.com.residencia.gestao_contratos.dtos.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioCriacaoRequest {
    private String nomeCompleto;
    private String cargo;
    private String cpf;
    private String email;
    private String telefone;
    private String senha; 
    private List<String> permissoes;
}