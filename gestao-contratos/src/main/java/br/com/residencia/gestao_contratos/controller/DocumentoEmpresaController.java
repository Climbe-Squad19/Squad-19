package br.com.residencia.gestao_contratos.controller;

import java.io.InputStream;
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

    // ✅ Valida se o arquivo é realmente um PDF pelos bytes internos
    private void validarArquivoPDF(MultipartFile arquivo) throws Exception {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new RuntimeException("Arquivo não pode ser vazio");
        }

        try (InputStream is = arquivo.getInputStream()) {
            byte[] header = new byte[4];
            int bytesLidos = is.read(header);

            if (bytesLidos < 4 ||
                header[0] != 0x25 || // %
                header[1] != 0x50 || // P
                header[2] != 0x44 || // D
                header[3] != 0x46) { // F
                throw new RuntimeException("Arquivo inválido: apenas PDFs são aceitos");
            }
        }

        long maxSize = 10 * 1024 * 1024; // 10MB
        if (arquivo.getSize() > maxSize) {
            throw new RuntimeException("Arquivo muito grande. Máximo permitido: 10MB");
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentoEmpresaResponse> upload(
            @RequestParam Long empresaId,
            @RequestParam String tipo,
            @RequestParam MultipartFile arquivo) throws Exception {

        // ✅ Valida o arquivo antes de qualquer coisa
        validarArquivoPDF(arquivo);

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