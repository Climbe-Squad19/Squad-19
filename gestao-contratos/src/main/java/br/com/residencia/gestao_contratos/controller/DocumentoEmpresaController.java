package br.com.residencia.gestao_contratos.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.residencia.gestao_contratos.classes.DocumentoEmpresa;
import br.com.residencia.gestao_contratos.dtos.response.DocumentoEmpresaResponse;
import br.com.residencia.gestao_contratos.services.DocumentoEmpresaService;

@RestController
@RequestMapping("/documentos")
public class DocumentoEmpresaController {

    private final DocumentoEmpresaService documentoService;

    public DocumentoEmpresaController(DocumentoEmpresaService documentoService) {
        this.documentoService = documentoService;
    }


    @PostMapping("/upload")
    public ResponseEntity<DocumentoEmpresaResponse> upload(
            @RequestParam Long empresaId,
            @RequestParam String tipo,
            @RequestParam MultipartFile arquivo) throws Exception {

        DocumentoEmpresa.TipoDocumento tipoDocumento;
        try {
            tipoDocumento = DocumentoEmpresa.TipoDocumento.valueOf(tipo.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Tipo inválido. Valores aceitos: "
                    + java.util.Arrays.toString(
                            DocumentoEmpresa.TipoDocumento.values()));
        }

        return new ResponseEntity<>(
                documentoService.upload(empresaId, tipoDocumento, arquivo),
                HttpStatus.CREATED);
    }


    @PostMapping("/{id}/validar")
    public ResponseEntity<DocumentoEmpresaResponse> validar(
            @PathVariable Long id,
            @RequestParam Long analistaId,
            @RequestParam boolean aprovado,
            @RequestParam(required = false) String motivoRejeicao) {
        return ResponseEntity.ok(
                documentoService.validar(id, analistaId, aprovado, motivoRejeicao));
    }

    @GetMapping("/empresa/{empresaId}")
    public ResponseEntity<List<DocumentoEmpresaResponse>> listarPorEmpresa(
            @PathVariable Long empresaId) {
        return ResponseEntity.ok(documentoService.listarPorEmpresa(empresaId));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        DocumentoEmpresa documento = documentoService.buscarParaDownload(id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + documento.getNomeArquivo() + "\"")
                .contentType(MediaType.parseMediaType(documento.getTipoArquivo()))
                .body(documento.getConteudo());
    }

    @GetMapping("/empresa/{empresaId}/completo")
    public ResponseEntity<Boolean> verificarCompleto(
            @PathVariable Long empresaId) {
        return ResponseEntity.ok(
                documentoService.todosDocumentosEnviados(empresaId));
    }

    @GetMapping("/empresa/{empresaId}/aprovado")
    public ResponseEntity<Boolean> verificarAprovado(
            @PathVariable Long empresaId) {
        return ResponseEntity.ok(
                documentoService.todosDocumentosAprovados(empresaId));
    }
}