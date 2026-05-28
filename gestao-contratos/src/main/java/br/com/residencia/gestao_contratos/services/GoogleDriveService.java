package br.com.residencia.gestao_contratos.services;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import br.com.residencia.gestao_contratos.classes.IntegracaoOAuthToken;

@Service
public class GoogleDriveService {

    private static final String DRIVE_MULTIPART_UPLOAD =
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink";

    private final WebClient webClient;
    private final GoogleOAuthTokenService googleOAuthTokenService;

    public GoogleDriveService(
            WebClient.Builder webClientBuilder,
            GoogleOAuthTokenService googleOAuthTokenService) {
        this.webClient = webClientBuilder.build();
        this.googleOAuthTokenService = googleOAuthTokenService;
    }

    public Optional<DriveUploadResult> uploadFileParaUsuarioLogado(
            String nomeArquivo,
            String contentType,
            byte[] conteudo) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return Optional.empty();
        }

        Optional<String> accessToken = googleOAuthTokenService.getValidAccessTokenForUserEmail(
                authentication.getName(),
                IntegracaoOAuthToken.ProvedorIntegracao.GOOGLEDRIVE);
        if (accessToken.isEmpty()) {
            return Optional.empty();
        }

        String safeName = nomeArquivo == null || nomeArquivo.isBlank()
                ? "documento-" + UUID.randomUUID()
                : nomeArquivo;
        String mime = contentType == null || contentType.isBlank()
                ? MediaType.APPLICATION_OCTET_STREAM_VALUE
                : contentType;

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("metadata", Map.of("name", safeName), MediaType.APPLICATION_JSON);
        builder.part("file", new ByteArrayResource(conteudo) {
            @Override
            public String getFilename() {
                return safeName;
            }
        }, MediaType.parseMediaType(mime));

        Map<?, ?> body = webClient.post()
                .uri(DRIVE_MULTIPART_UPLOAD)
                .headers(headers -> headers.setBearerAuth(accessToken.get()))
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (body == null || body.get("id") == null) {
            return Optional.empty();
        }

        String id = String.valueOf(body.get("id"));
        String webViewLink = body.get("webViewLink") != null
                ? String.valueOf(body.get("webViewLink"))
                : ("https://drive.google.com/file/d/" + id + "/view");

        return Optional.of(new DriveUploadResult(id, webViewLink));
    }

    public record DriveUploadResult(String fileId, String webViewLink) {
        @Override
        public String toString() {
            return fileId + " -> " + webViewLink;
        }
    }
}
