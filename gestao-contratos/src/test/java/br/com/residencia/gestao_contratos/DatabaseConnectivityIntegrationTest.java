package br.com.residencia.gestao_contratos;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import br.com.residencia.gestao_contratos.repository.UsuarioRepository;

@SpringBootTest
@ActiveProfiles("local")
class DatabaseConnectivityIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void dataSourceAceitaConexao() throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            assertThat(conn.isValid(5)).isTrue();
        }
    }

    @Test
    void jpaExecutaConsultaSimples() {
        assertThat(usuarioRepository.count()).isGreaterThanOrEqualTo(0L);
    }
}
