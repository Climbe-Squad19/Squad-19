package br.com.residencia.gestao_contratos;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

/**
 * Só roda quando {@code CLIMBE_TEST_MYSQL=true} e as variáveis do perfil {@code mysql}
 * estiverem definidas ({@code MYSQL_URL}, senha, etc.).
 *
 * <pre>
 * export CLIMBE_TEST_MYSQL=true
 * export SPRING_PROFILES_ACTIVE=mysql
 * export MYSQL_URL='jdbc:mysql://127.0.0.1:3306/climbe?...'
 * export MYSQL_USERNAME=root
 * export MYSQL_PASSWORD=...
 * mvn test -Dtest=MysqlDatabaseIntegrationTest
 * </pre>
 */
@SpringBootTest
@ActiveProfiles("mysql")
@EnabledIfEnvironmentVariable(named = "CLIMBE_TEST_MYSQL", matches = "true")
class MysqlDatabaseIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void conexaoEhMySql() throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            assertThat(conn.isValid(5)).isTrue();
            assertThat(conn.getMetaData().getDatabaseProductName().toLowerCase()).contains("mysql");
        }
    }

    @Test
    void jpaRepoResponde() {
        assertThat(usuarioRepository.count()).isGreaterThanOrEqualTo(0L);
    }
}
