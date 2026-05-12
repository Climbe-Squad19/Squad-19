package br.com.residencia.gestao_contratos.services;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriUtils;

import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
@ConditionalOnProperty(prefix = "app.s3", name = "enabled", havingValue = "true")
public class S3StorageService {

    private final S3Client s3Client;
    private final String bucket;
    private final String publicUrlBase;

    public S3StorageService(
            S3Client s3Client,
            @Value("${app.s3.bucket}") String bucket,
            @Value("${app.s3.public-url-base:}") String publicUrlBase) {
        this.s3Client = s3Client;
        this.bucket = bucket;
        this.publicUrlBase = publicUrlBase;
    }

    public StoredObject upload(byte[] content, String fileName, String contentType, Long empresaId) {
        String key = "documentos/empresa-" + empresaId + "/" + UUID.randomUUID() + "-" + sanitize(fileName);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .contentLength((long) content.length)
                .build();

        try {
            s3Client.putObject(request, RequestBody.fromBytes(content));
        } catch (S3Exception e) {
            throw new RuntimeException("Falha ao enviar arquivo para o S3", e);
        }

        String url = buildObjectUrl(key);
        return new StoredObject(key, url);
    }

    private String buildObjectUrl(String key) {
        if (StringUtils.hasText(publicUrlBase)) {
            String base = publicUrlBase.endsWith("/")
                    ? publicUrlBase.substring(0, publicUrlBase.length() - 1)
                    : publicUrlBase;
            String encodedKey = Arrays.stream(key.split("/"))
                    .map(segment -> UriUtils.encodePathSegment(segment, StandardCharsets.UTF_8))
                    .collect(Collectors.joining("/"));
            return base + "/" + encodedKey;
        }
        return s3Client.utilities()
                .getUrl(builder -> builder.bucket(bucket).key(key))
                .toExternalForm();
    }

    public byte[] download(String key) {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();

        ResponseBytes<GetObjectResponse> response = s3Client.getObjectAsBytes(request);
        return response.asByteArray();
    }

    private String sanitize(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "arquivo";
        }
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    public record StoredObject(String key, String url) {
    }
}
