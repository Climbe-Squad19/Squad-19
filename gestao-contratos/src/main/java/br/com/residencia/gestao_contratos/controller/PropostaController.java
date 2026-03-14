package br.com.residencia.gestao_contratos.controller;

import br.com.residencia.gestao_contratos.classes.Proposta;
import br.com.residencia.gestao_contratos.repository.PropostaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/propostas")
public class PropostaController {

    private final PropostaRepository propostaRepository;

    public PropostaController(PropostaRepository propostaRepository) {
        this.propostaRepository = propostaRepository;
    }

    @GetMapping
    public List<Proposta> getAll() {
        return propostaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proposta> getById(@PathVariable Long id) {
        return propostaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposta nao encontrada"));
    }

    @PostMapping
    public ResponseEntity<Proposta> create(@RequestBody Proposta proposta) {
        Proposta saved = propostaRepository.save(proposta);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proposta> update(@PathVariable Long id, @RequestBody Proposta proposta) {
        Proposta existing = propostaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposta nao encontrada"));

        existing.setEmpresa(proposta.getEmpresa());
        existing.setServicoContratado(proposta.getServicoContratado());
        existing.setValorMensal(proposta.getValorMensal());
        existing.setValorSetup(proposta.getValorSetup());
        existing.setDataEmissao(proposta.getDataEmissao());
        existing.setLinkGoogleDrive(proposta.getLinkGoogleDrive());
        existing.setStatus(proposta.getStatus());

        Proposta updated = propostaRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Proposta existing = propostaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposta nao encontrada"));

        propostaRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }
}
