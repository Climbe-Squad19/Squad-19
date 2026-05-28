package br.com.residencia.gestao_contratos.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthMeResponse {
    private UsuarioResponse usuario;
    /** CEO, Compliance ou Membro do Conselho (mesma regra de /usuarios/pendentes). */
    private boolean podeGerenciarCadastros;
}
