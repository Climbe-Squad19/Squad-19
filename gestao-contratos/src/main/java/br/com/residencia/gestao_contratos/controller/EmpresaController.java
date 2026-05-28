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

import br.com.residencia.gestao_contratos.dtos.request.EmpresaAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.EmpresaCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.EmpresaResponse;
import br.com.residencia.gestao_contratos.services.EmpresaService;

@RestController
@RequestMapping("/empresas")
public class EmpresaController {

    private final EmpresaService empresaService;

    public EmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    @GetMapping
    public ResponseEntity<List<EmpresaResponse>> getAll() {
        return ResponseEntity.ok(empresaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(empresaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<EmpresaResponse> create(
            @RequestBody EmpresaCriacaoRequest request) {
        return new ResponseEntity<>(empresaService.criar(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaResponse> update(
            @PathVariable Long id,
            @RequestBody EmpresaAtualizacaoRequest request) {
        return ResponseEntity.ok(empresaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        empresaService.inativar(id);
        return ResponseEntity.noContent().build();
    }
}