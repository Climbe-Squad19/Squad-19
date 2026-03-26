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

import br.com.residencia.gestao_contratos.dtos.request.ReuniaoAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.ReuniaoCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.ReuniaoResponse;
import br.com.residencia.gestao_contratos.services.ReuniaoService;

@RestController
@RequestMapping("/reunioes")
public class ReuniaoController {

    private final ReuniaoService reuniaoService;

    public ReuniaoController(ReuniaoService reuniaoService) {
        this.reuniaoService = reuniaoService;
    }

    @GetMapping
    public ResponseEntity<List<ReuniaoResponse>> getAll() {
        return ResponseEntity.ok(reuniaoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReuniaoResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reuniaoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ReuniaoResponse> create(
            @RequestBody ReuniaoCriacaoRequest request) {
        return new ResponseEntity<>(reuniaoService.agendar(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReuniaoResponse> update(
            @PathVariable Long id,
            @RequestBody ReuniaoAtualizacaoRequest request) {
        return ResponseEntity.ok(reuniaoService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reuniaoService.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}