package br.com.residencia.gestao_contratos;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Gestão de Contratos API")
                        .version("v1")
                        .description("Documentação Swagger para testes do backend")
                        .contact(new Contact().name("Equipe Climb").email("suporte@climb.com"))
                );
    }
}
