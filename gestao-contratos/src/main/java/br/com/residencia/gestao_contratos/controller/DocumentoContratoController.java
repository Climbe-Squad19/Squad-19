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

import br.com.residencia.gestao_contratos.classes.DocumentoContrato;
import br.com.residencia.gestao_contratos.dtos.response.DocumentoContratoResponse;
import br.com.residencia.gestao_contratos.services.DocumentoContratoService;

@RestController
@RequestMapping("/contratos/{contratoId}/documentos")
public class DocumentoContratoController {

    private final DocumentoContratoService documentoService;

    public DocumentoContratoController(DocumentoContratoService documentoService) {
        this.documentoService = documentoService;
    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentoContratoResponse> upload(
            @PathVariable Long contratoId,
            @RequestParam Long usuarioId,
            @RequestParam MultipartFile arquivo) throws Exception {
        return new ResponseEntity<>(
                documentoService.upload(contratoId, usuarioId, arquivo),
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DocumentoContratoResponse>> listar(
            @PathVariable Long contratoId) {
        return ResponseEntity.ok(documentoService.listarPorContrato(contratoId));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(
            @PathVariable Long contratoId,
            @PathVariable Long id) {
        DocumentoContrato documento = documentoService.buscarParaDownload(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + documento.getNomeArquivo() + "\"")
                .contentType(MediaType.parseMediaType(documento.getTipoArquivo()))
                .body(documento.getConteudo());
    }
}