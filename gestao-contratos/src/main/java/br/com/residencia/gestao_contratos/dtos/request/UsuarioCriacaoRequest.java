package br.com.residencia.gestao_contratos.dtos.request;

import java.util.List;

import br.com.residencia.gestao_contratos.classes.Cargo;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioCriacaoRequest {
    private String nomeCompleto;
    private Cargo cargo;
    private List<Cargo> permissoes;
    private String cpf;
    private String email;
    private String telefone;
    private String senha; 
}