package br.com.residencia.gestao_contratos.dtos.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpresaResponse {
    private Long id;
    private String razaoSocial;
    private String nomeFantasia;
    private String cnpj;
    private String logradouro;
    private String numero;
    private String bairro;
    private String cidade;
    private String uf;
    private String cep;
    private String telefone;
    private String emailContato;
    private String nomeRepresentante;
    private String cpfRepresentante; 
    private String contatoRepresentante;
    private boolean ativa;
    private LocalDateTime dataCadastro;
}