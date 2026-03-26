package br.com.residencia.gestao_contratos.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.com.residencia.gestao_contratos.dtos.request.ContratoAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.ContratoCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.ContratoResponse;
import br.com.residencia.gestao_contratos.services.ContratoService;

@RestController
@RequestMapping("/contratos")
public class ContratoController {

    private final ContratoService contratoService;

    public ContratoController(ContratoService contratoService) {
        this.contratoService = contratoService;
    }

    @GetMapping
    public ResponseEntity<List<ContratoResponse>> getAll() {
        return ResponseEntity.ok(contratoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContratoResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contratoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ContratoResponse> create(
            @RequestBody ContratoCriacaoRequest request) {
        return new ResponseEntity<>(contratoService.criar(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContratoResponse> update(
            @PathVariable Long id,
            @RequestBody ContratoAtualizacaoRequest request) {
        return ResponseEntity.ok(contratoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contratoService.encerrar(id);
        return ResponseEntity.noContent().build();
    }
}