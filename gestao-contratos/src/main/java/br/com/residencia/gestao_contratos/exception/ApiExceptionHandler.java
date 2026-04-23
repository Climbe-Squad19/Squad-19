package br.com.residencia.gestao_contratos.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

/**
 * Garante corpo JSON com {@code message} / {@code detail} em erros HTTP (ex.: 403), para o front não
 * receber resposta vazia dependendo da configuração do Spring MVC / ProblemDetails.
 */
@RestControllerAdvice
@Order(0)
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        int status = ex.getStatusCode().value();
        String reason = ex.getReason();
        if (reason == null || reason.isBlank()) {
            reason = ex.getStatusCode().toString();
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status);
        body.put("message", reason);
        body.put("detail", reason);
        return ResponseEntity.status(ex.getStatusCode()).body(body);
    }
}
