package br.com.residencia.gestao_contratos.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.residencia.gestao_contratos.classes.DocumentoEmpresa;
import br.com.residencia.gestao_contratos.classes.Empresa;
import br.com.residencia.gestao_contratos.classes.Usuario;
import br.com.residencia.gestao_contratos.dtos.response.DocumentoEmpresaResponse;
import br.com.residencia.gestao_contratos.repository.DocumentoEmpresaRepository;
import br.com.residencia.gestao_contratos.repository.EmpresaRepository;
import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@Service
public class DocumentoEmpresaService {

    @Autowired
    private DocumentoEmpresaRepository documentoRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired(required = false)
    private S3StorageService s3StorageService;

    @Autowired
    private GoogleDriveService googleDriveService;

    @Value("${app.s3.enabled:false}")
    private boolean s3Enabled;


    @Transactional
    public DocumentoEmpresaResponse upload(
            Long empresaId,
            DocumentoEmpresa.TipoDocumento tipo,
            MultipartFile arquivo) throws Exception {

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));

        DocumentoEmpresa documento = new DocumentoEmpresa();
        documento.setEmpresa(empresa);
        documento.setTipo(tipo);
        documento.setNomeArquivo(arquivo.getOriginalFilename());
        documento.setTipoArquivo(arquivo.getContentType());
        documento.setTamanhoBytes(arquivo.getSize());
        byte[] conteudo = arquivo.getBytes();
        if (s3Enabled && s3StorageService != null) {
            S3StorageService.StoredObject storedObject = s3StorageService.upload(
                    conteudo,
                    arquivo.getOriginalFilename(),
                    arquivo.getContentType(),
                    empresaId);
            documento.setS3Key(storedObject.key());
            documento.setS3Url(storedObject.url());
            documento.setConteudo(null);
        } else {
            documento.setConteudo(conteudo);
        }
        documento.setStatus(DocumentoEmpresa.StatusDocumento.PENDENTE);
        documento.setDataUpload(LocalDateTime.now());

        DocumentoEmpresa salvo = documentoRepository.save(documento);
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
            // Drive é opcional; não deve bloquear o upload principal.
        }
        return converterParaResponse(salvo);
    }


    @Transactional
    public DocumentoEmpresaResponse validar(
            Long id,
            Long analistaId,
            boolean aprovado,
            String motivoRejeicao) {

        DocumentoEmpresa documento = buscarPorId(id);

        Usuario analista = usuarioRepository.findById(analistaId)
                .orElseThrow(() -> new RuntimeException("Analista não encontrado"));

        documento.setValidadoPor(analista);
        documento.setDataValidacao(LocalDateTime.now());

        if (aprovado) {
            documento.setStatus(DocumentoEmpresa.StatusDocumento.APROVADO);
        } else {
            if (motivoRejeicao == null || motivoRejeicao.isEmpty())
                throw new RuntimeException("Motivo de rejeição obrigatório");
            documento.setStatus(DocumentoEmpresa.StatusDocumento.REJEITADO);
            documento.setMotivoRejeicao(motivoRejeicao);
        }

        DocumentoEmpresa atualizado = documentoRepository.save(documento);
        return converterParaResponse(atualizado);
    }


    public DocumentoEmpresa buscarParaDownload(Long id) {
        DocumentoEmpresa documento = buscarPorId(id);
        if (s3Enabled && s3StorageService != null && documento.getS3Key() != null) {
            documento.setConteudo(s3StorageService.download(documento.getS3Key()));
        }
        return documento;
    }

    public List<DocumentoEmpresaResponse> listarPorEmpresa(Long empresaId) {
        return documentoRepository.findByEmpresaId(empresaId).stream()
                .map(this::converterParaResponse)
                .collect(Collectors.toList());
    }


    public boolean todosDocumentosEnviados(Long empresaId) {
        List<DocumentoEmpresa> documentos = documentoRepository
                .findByEmpresaId(empresaId);

        List<DocumentoEmpresa.TipoDocumento> tiposEnviados = documentos.stream()
                .map(DocumentoEmpresa::getTipo)
                .collect(Collectors.toList());

        for (DocumentoEmpresa.TipoDocumento tipo :
                DocumentoEmpresa.TipoDocumento.values()) {
            if (!tiposEnviados.contains(tipo)) return false;
        }
        return true;
    }


    public boolean todosDocumentosAprovados(Long empresaId) {
        List<DocumentoEmpresa> documentos = documentoRepository
                .findByEmpresaId(empresaId);

        return documentos.stream()
                .allMatch(d -> d.getStatus() ==
                        DocumentoEmpresa.StatusDocumento.APROVADO);
    }

    private DocumentoEmpresa buscarPorId(Long id) {
        return documentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Documento não encontrado"));
    }

    private DocumentoEmpresaResponse converterParaResponse(DocumentoEmpresa doc) {
        DocumentoEmpresaResponse response = new DocumentoEmpresaResponse();
        response.setId(doc.getId());
        response.setEmpresaId(doc.getEmpresa().getId());
        response.setNomeEmpresa(doc.getEmpresa().getRazaoSocial());
        response.setTipo(doc.getTipo());
        response.setStatus(doc.getStatus());
        response.setNomeArquivo(doc.getNomeArquivo());
        response.setTipoArquivo(doc.getTipoArquivo());
        response.setTamanhoBytes(doc.getTamanhoBytes());
        response.setS3Url(doc.getS3Url());
        response.setGoogleDriveFileId(doc.getGoogleDriveFileId());
        response.setGoogleDriveWebViewLink(doc.getGoogleDriveWebViewLink());
        response.setMotivoRejeicao(doc.getMotivoRejeicao());
        response.setDataUpload(doc.getDataUpload());
        response.setDataValidacao(doc.getDataValidacao());

        if (doc.getValidadoPor() != null) {
            response.setValidadoPorId(doc.getValidadoPor().getId());
            response.setNomeValidadoPor(doc.getValidadoPor().getNomeCompleto());
        }

        return response;
    }
}