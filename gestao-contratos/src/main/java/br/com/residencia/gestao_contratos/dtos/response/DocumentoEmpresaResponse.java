package br.com.residencia.gestao_contratos.dtos.response;

import br.com.residencia.gestao_contratos.classes.DocumentoEmpresa;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentoEmpresaResponse {
    private Long id;
    private Long empresaId;
    private String nomeEmpresa;
    private DocumentoEmpresa.TipoDocumento tipo;
    private DocumentoEmpresa.StatusDocumento status;
    private String nomeArquivo;
    private String tipoArquivo;
    private Long tamanhoBytes;
    private String motivoRejeicao;
    private Long validadoPorId;
    private String nomeValidadoPor;
    private LocalDateTime dataUpload;
    private LocalDateTime dataValidacao;
}