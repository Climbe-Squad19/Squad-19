package br.com.residencia.gestao_contratos.classes;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "empresas")
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String razaoSocial;

    private String nomeFantasia;

    @Column(unique = true, nullable = false, length = 18)
    private String cnpj;

    private String logradouro;
    @Column(length = 32)
    private String numero;
    @Column(length = 128)
    private String bairro;
    @Column(length = 128)
    private String cidade;
    @Column(length = 2)
    private String uf;
    @Column(length = 16)
    private String cep;

    @Column(length = 50)
    private String telefone;
    private String emailContato;

    private String nomeRepresentante;
    @Column(length = 14)
    private String cpfRepresentante;
    @Column(length = 50)
    private String contatoRepresentante;

    private boolean ativa;              

    @Column(updatable = false)
    private LocalDateTime dataCadastro; 
}