package br.com.residencia.gestao_contratos.dtos.response;

import java.time.LocalDateTime;
import java.util.List;

import br.com.residencia.gestao_contratos.classes.Cargo;
import br.com.residencia.gestao_contratos.classes.Usuario.SituacaoUsuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {
    private Long id;
    private String nomeCompleto;
    private Cargo cargo;
    private List<Cargo> permissoes;
    private String email;
    private String cpf; // pode manter pq ele vai ser mascarado no service
    private String telefone;
    private boolean ativo;
    private SituacaoUsuario situacao;
    private String fotoPerfilUrl;
    private LocalDateTime dataCriacao;
}