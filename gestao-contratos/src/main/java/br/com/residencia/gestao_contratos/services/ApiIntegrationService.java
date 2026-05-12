package br.com.residencia.gestao_contratos.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class ApiIntegrationService {

    private final WebClient webClient;

    public ApiIntegrationService(
            WebClient.Builder webClientBuilder,
            @Value("${external.api.base-url:https://api.example.com}") String baseUrl) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public String buscarPropostaExterna(Long propostaId) {
        return webClient.get()
                .uri("/propostas/{id}", propostaId)
                .retrieve()
                .bodyToMono(String.class)
                .block(); // Para resposta síncrona
    }
}
