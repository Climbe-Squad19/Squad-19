package br.com.residencia.gestao_contratos.controller;

import br.com.residencia.gestao_contratos.classes.Contrato;
import br.com.residencia.gestao_contratos.repository.ContratoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/contratos")
public class ContratoController {

    private final ContratoRepository contratoRepository;

    public ContratoController(ContratoRepository contratoRepository) {
        this.contratoRepository = contratoRepository;
    }

    @GetMapping
    public List<Contrato> getAll() {
        return contratoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contrato> getById(@PathVariable Long id) {
        return contratoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato nao encontrado"));
    }

    @PostMapping
    public ResponseEntity<Contrato> create(@RequestBody Contrato contrato) {
        Contrato saved = contratoRepository.save(contrato);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contrato> update(@PathVariable Long id, @RequestBody Contrato contrato) {
        Contrato existing = contratoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato nao encontrado"));

        existing.setPropostaOrigem(contrato.getPropostaOrigem());
        existing.setEmpresa(contrato.getEmpresa());
        existing.setDataInicio(contrato.getDataInicio());
        existing.setDataFim(contrato.getDataFim());
        existing.setLinkContratoAssinado(contrato.getLinkContratoAssinado());
        existing.setRenovacaoAutomatica(contrato.isRenovacaoAutomatica());
        existing.setObservacoes(contrato.getObservacoes());

        Contrato updated = contratoRepository.save(existing);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Contrato existing = contratoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato nao encontrado"));

        contratoRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }
}
