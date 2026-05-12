package br.com.residencia.gestao_contratos.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class TokenEncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;    
    private static final int GCM_TAG_LENGTH = 128;  

    private final SecretKeySpec secretKey;

    public TokenEncryptionService(
            @Value("${app.token.encryption.key:}") String encryptionKey) {

        if (encryptionKey == null || encryptionKey.isBlank()) {
            System.err.println(
                "[TokenEncryption] AVISO: TOKEN_ENCRYPTION_KEY não configurada. " +
                "Usando chave de desenvolvimento (NÃO use em produção!). " +
                "Defina a variável app.token.encryption.key com 32 caracteres."
            );
            encryptionKey = "climbe-dev-key-32-chars-exactly!";
        }

        byte[] keyBytes = encryptionKey.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        } else if (keyBytes.length > 32) {
            byte[] truncated = new byte[32];
            System.arraycopy(keyBytes, 0, truncated, 0, 32);
            keyBytes = truncated;
        }

        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }

    /**
     * Criptografa um token para armazenamento seguro no banco.
     *
     * @param plainToken  token em texto puro (access_token ou refresh_token do Google)
     * @return            string Base64 com IV + ciphertext + tag de autenticação,
     *                    pronta para salvar na coluna VARCHAR do banco
     */
    public String encrypt(String plainToken) {
        if (plainToken == null || plainToken.isBlank()) {
            return plainToken;
        }

        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec paramSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, paramSpec);

            byte[] cipherText = cipher.doFinal(
                    plainToken.getBytes(StandardCharsets.UTF_8)
            );

            byte[] encryptedWithIv = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, encryptedWithIv, 0, iv.length);
            System.arraycopy(cipherText, 0, encryptedWithIv, iv.length, cipherText.length);

            return Base64.getEncoder().encodeToString(encryptedWithIv);

        } catch (Exception e) {
            throw new RuntimeException("Falha ao criptografar token OAuth", e);
        }
    }

    /**
     * Descriptografa um token recuperado do banco.
     *
     * @param encryptedToken  string Base64 retornada pelo banco
     * @return                token em texto puro, pronto para usar na API do Google
     */
    public String decrypt(String encryptedToken) {
        if (encryptedToken == null || encryptedToken.isBlank()) {
            return encryptedToken;
        }

        if (!isBase64Encrypted(encryptedToken)) {
            System.err.println(
                "[TokenEncryption] AVISO: Token legado detectado (texto puro). " +
                "Considere re-encriptar os tokens existentes no banco."
            );
            return encryptedToken;
        }

        try {
            byte[] encryptedWithIv = Base64.getDecoder().decode(encryptedToken);

            byte[] iv = new byte[GCM_IV_LENGTH];
            byte[] cipherText = new byte[encryptedWithIv.length - GCM_IV_LENGTH];
            System.arraycopy(encryptedWithIv, 0, iv, 0, GCM_IV_LENGTH);
            System.arraycopy(encryptedWithIv, GCM_IV_LENGTH, cipherText, 0, cipherText.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec paramSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, paramSpec);

            byte[] plainText = cipher.doFinal(cipherText);
            return new String(plainText, StandardCharsets.UTF_8);

        } catch (Exception e) {
            throw new RuntimeException(
                "Falha ao descriptografar token OAuth. " +
                "Verifique se TOKEN_ENCRYPTION_KEY não foi alterada.", e
            );
        }
    }

    private boolean isBase64Encrypted(String value) {
        try {
            byte[] decoded = Base64.getDecoder().decode(value);
            return decoded.length > GCM_IV_LENGTH;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}