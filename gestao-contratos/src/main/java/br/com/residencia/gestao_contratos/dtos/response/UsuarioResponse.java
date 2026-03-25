package br.com.residencia.gestao_contratos.dtos.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {
    private Long id;
    private String nomeCompleto;
    private String cargo;
    private String email;
    private String cpf; 
    private String telefone;
    private boolean ativo;
    private List<String> permissoes;
    private String fotoPerfilUrl; 
    private LocalDateTime dataCriacao;
}