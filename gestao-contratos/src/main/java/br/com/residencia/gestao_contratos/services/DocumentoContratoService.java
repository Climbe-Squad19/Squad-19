package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.residencia.gestao_contratos.classes.Contrato;
import br.com.residencia.gestao_contratos.classes.DocumentoContrato;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.dtos.response.DocumentoContratoResponse;
import br.com.residencia.gestao_contratos.repository.ContratoRepository;
import br.com.residencia.gestao_contratos.repository.DocumentoContratoRepository;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Service
public class DocumentoContratoService {

    @Autowired
    private DocumentoContratoRepository documentoRepository;

    @Autowired
    private ContratoRepository contratoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired(required = false)
    private S3StorageService s3StorageService;

    @Autowired
    private GoogleDriveService googleDriveService;

    @Value("${app.s3.enabled:false}")
    private boolean s3Enabled;

    @Transactional
    public DocumentoContratoResponse upload(
            Long contratoId,
            Long usuarioId,
            MultipartFile arquivo) throws Exception {

        Contrato contrato = contratoRepository.findById(contratoId)
                .orElseThrow(() -> new RuntimeException("Contrato não encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        DocumentoContrato documento = new DocumentoContrato();
        documento.setContrato(contrato);
        documento.setEnviadoPor(usuario);
        documento.setNomeArquivo(arquivo.getOriginalFilename());
        documento.setTipoArquivo(arquivo.getContentType());
        documento.setTamanhoBytes(arquivo.getSize());
        documento.setDataUpload(LocalDateTime.now());

        byte[] conteudo = arquivo.getBytes();

        if (s3Enabled && s3StorageService != null) {
            S3StorageService.StoredObject storedObject = s3StorageService.upload(
                    conteudo,
                    arquivo.getOriginalFilename(),
                    arquivo.getContentType(),
                    contratoId);
            documento.setS3Key(storedObject.key());
            documento.setS3Url(storedObject.url());
            documento.setConteudo(null);
        } else {
            documento.setConteudo(conteudo);
        }

        DocumentoContrato salvo = documentoRepository.save(documento);

        try {
            googleDriveService.uploadFileParaUsuarioLogado(
                            arquivo.getOriginalFilename(),
                            arquivo.getContentType(),
                            conteudo)
                    .ifPresent(result -> {
                        salvo.setGoogleDriveFileId(result.fileId());
                        salvo.setGoogleDriveWebViewLink(result.webViewLink());
                        documentoRepository.save(salvo);
                    });
        } catch (Exception ignored) {
        }

        return converterParaResponse(salvo);
    }

    public List<DocumentoContratoResponse> listarPorContrato(Long contratoId) {
        return documentoRepository.findByContratoId(contratoId).stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }

    public DocumentoContrato buscarParaDownload(Long id) {
        DocumentoContrato documento = documentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Documento não encontrado"));
        if (s3Enabled && s3StorageService != null && documento.getS3Key() != null) {
            documento.setConteudo(s3StorageService.download(documento.getS3Key()));
        }
        return documento;
    }

    private DocumentoContratoResponse converterParaResponse(DocumentoContrato doc) {
        DocumentoContratoResponse response = new DocumentoContratoResponse();
        response.setId(doc.getId());
        response.setContratoId(doc.getContrato().getId());
        response.setNomeArquivo(doc.getNomeArquivo());
        response.setTipoArquivo(doc.getTipoArquivo());
        response.setTamanhoBytes(doc.getTamanhoBytes());
        response.setS3Url(doc.getS3Url());
        response.setGoogleDriveWebViewLink(doc.getGoogleDriveWebViewLink());
        response.setDataUpload(doc.getDataUpload());

        if (doc.getEnviadoPor() != null) {
            response.setEnviadoPorId(doc.getEnviadoPor().getId());
            response.setNomeEnviadoPor(doc.getEnviadoPor().getNomeCompleto());
        }

        return response;
    }
}