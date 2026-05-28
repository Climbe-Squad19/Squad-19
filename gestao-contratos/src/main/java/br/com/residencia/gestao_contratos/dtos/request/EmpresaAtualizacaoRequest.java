package br.com.residencia.gestao_contratos.dtos.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpresaAtualizacaoRequest {
    private String razaoSocial;
    private String nomeFantasia;
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
}