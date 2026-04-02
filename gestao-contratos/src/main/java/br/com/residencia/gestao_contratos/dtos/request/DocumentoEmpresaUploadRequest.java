package br.com.residencia.gestao_contratos.dtos.request;

import br.com.residencia.gestao_contratos.classes.DocumentoEmpresa;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentoEmpresaUploadRequest {
    private Long empresaId;
    private DocumentoEmpresa.TipoDocumento tipo;
}