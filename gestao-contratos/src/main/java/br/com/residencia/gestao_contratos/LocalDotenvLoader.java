package br.com.residencia.gestao_contratos;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Carrega {@code .env} na raiz do processo (ou {@code gestao-contratos/.env} se o cwd for a raiz do monorepo).
 * Só define propriedades que ainda não existem no ambiente — assim {@code ./mvnw spring-boot:run} funciona
 * sem {@code source .env}, e o IDE também enxerga as chaves ao rodar com working directory correto.
 */
public final class LocalDotenvLoader {

    private LocalDotenvLoader() {}

    public static void load() {
        Path[] candidates = new Path[] {
                Path.of(".env"),
                Path.of("gestao-contratos/.env"),
        };
        for (Path envFile : candidates) {
            if (!Files.isRegularFile(envFile)) {
                continue;
            }
            try {
                for (String line : Files.readAllLines(envFile, StandardCharsets.UTF_8)) {
                    String t = line.trim();
                    if (t.isEmpty() || t.startsWith("#")) {
                        continue;
                    }
                    int eq = t.indexOf('=');
                    if (eq <= 0) {
                        continue;
                    }
                    String key = t.substring(0, eq).trim();
                    String val = t.substring(eq + 1).trim();
                    if (key.isEmpty()) {
                        continue;
                    }
                    if (System.getenv(key) != null) {
                        continue;
                    }
                    if (System.getProperty(key) != null) {
                        continue;
                    }
                    System.setProperty(key, val);
                    // Spring Boot lê perfis em spring.profiles.active; variável de ambiente SPRING_PROFILES_ACTIVE
                    // é mapeada pelo OS, mas .env vira só system property — duplicamos aqui.
                    if ("SPRING_PROFILES_ACTIVE".equals(key) && !val.isEmpty()) {
                        System.setProperty("spring.profiles.active", val);
                    }
                }
            } catch (IOException ignored) {
                // opcional: sem .env ou sem permissão — segue só com env do SO
            }
            return;
        }
    }
}
