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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.residencia.gestao_contratos.classes.Proposta;
import br.com.residencia.gestao_contratos.dtos.request.PropostaAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.PropostaCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.PropostaResponse;
import br.com.residencia.gestao_contratos.services.PropostaService;

@RestController
@RequestMapping("/propostas")
public class PropostaController {

    private final PropostaService propostaService;

    public PropostaController(PropostaService propostaService) {
        this.propostaService = propostaService;
    }

    @GetMapping
    public ResponseEntity<List<PropostaResponse>> getAll() {
        return ResponseEntity.ok(propostaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropostaResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(propostaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<PropostaResponse> create(
            @RequestBody PropostaCriacaoRequest request) {
        return new ResponseEntity<>(propostaService.criar(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PropostaResponse> update(
            @PathVariable Long id,
            @RequestBody PropostaAtualizacaoRequest request) {
        return ResponseEntity.ok(propostaService.atualizar(id, request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PropostaResponse> atualizarStatus(
            @PathVariable Long id,
            @RequestParam Proposta.StatusProposta status,
            @RequestParam(required = false) String motivoRecusa) {
        return ResponseEntity.ok(
                propostaService.atualizarStatus(id, status, motivoRecusa));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        propostaService.inativar(id);
        return ResponseEntity.noContent().build();
    }
}