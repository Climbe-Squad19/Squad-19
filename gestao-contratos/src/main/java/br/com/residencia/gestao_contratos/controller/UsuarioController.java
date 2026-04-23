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
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import br.com.residencia.gestao_contratos.dtos.request.UsuarioAtualizacaoRequest;
import br.com.residencia.gestao_contratos.dtos.request.UsuarioCriacaoRequest;
import br.com.residencia.gestao_contratos.dtos.response.UsuarioResponse;
import br.com.residencia.gestao_contratos.services.UsuarioService;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> getAll() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/analistas")
    public ResponseEntity<List<UsuarioResponse>> getAnalistas() {
        return ResponseEntity.ok(usuarioService.listarAnalistas());
    }

    @GetMapping("/gestores")
    public ResponseEntity<List<UsuarioResponse>> getGestores() {
        return ResponseEntity.ok(usuarioService.listarPorCargos(List.of(
                br.com.residencia.gestao_contratos.classes.Cargo.CMO,
                br.com.residencia.gestao_contratos.classes.Cargo.CSO,
                br.com.residencia.gestao_contratos.classes.Cargo.CEO,
                br.com.residencia.gestao_contratos.classes.Cargo.CFO
        )));
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<UsuarioResponse>> listarPendentes() {
        return ResponseEntity.ok(usuarioService.listarPendentes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> create(
            @RequestBody UsuarioCriacaoRequest request) {
        return new ResponseEntity<>(usuarioService.criar(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> update(
            @PathVariable Long id,
            @RequestBody UsuarioAtualizacaoRequest request) {
        return ResponseEntity.ok(usuarioService.atualizar(id, request));
    }

    /** PATCH e POST: alguns ambientes bloqueiam PATCH; o front usa POST com corpo JSON vazio. */
    @RequestMapping(value = "/{id}/aprovar", method = { RequestMethod.PATCH, RequestMethod.POST })
    public ResponseEntity<UsuarioResponse> aprovar(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.aprovarCadastro(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        usuarioService.inativar(id);
        return ResponseEntity.noContent().build();
    }
}